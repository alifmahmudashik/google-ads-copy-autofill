document.addEventListener('DOMContentLoaded', function () {

  // ── Tab Switching ──────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('section-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ── Character Counter Hints ────────────────────────────────
  function updateCharHints(textareaId, hintId, maxChars) {
    const ta   = document.getElementById(textareaId);
    const hint = document.getElementById(hintId);
    ta.addEventListener('input', () => {
      const lines = ta.value.split('\n').filter(l => l.trim() !== '');
      if (lines.length === 0) {
        hint.textContent = '';
        hint.className   = 'char-hint';
        return;
      }
      const overlimit = lines.filter(l => l.length > maxChars);
      if (overlimit.length > 0) {
        hint.textContent = `⚠ ${overlimit.length} line(s) exceed ${maxChars} chars`;
        hint.className   = 'char-hint error';
      } else {
        const maxUsed    = Math.max(...lines.map(l => l.length));
        hint.textContent = `${lines.length} line(s) · longest: ${maxUsed}/${maxChars} chars`;
        hint.className   = maxUsed >= maxChars * 0.9 ? 'char-hint warn' : 'char-hint';
      }
    });
  }

  updateCharHints('headlinesInput',     'headlineCharHint',     30);
  updateCharHints('longHeadlinesInput', 'longHeadlineCharHint', 90);
  updateCharHints('descriptionsInput',  'descriptionCharHint',  90);

  // ── Helpers ────────────────────────────────────────────────
  function showStatus(id, message, type = 'success') {
    const el       = document.getElementById(id);
    el.textContent = message;
    el.className   = 'status ' + type;
    setTimeout(() => {
      el.textContent = '';
      el.className   = 'status';
    }, 3500);
  }

  async function runScript(func, args = []) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func,
      args
    });
    return results[0]?.result;
  }

  // ── Page-injected Functions ────────────────────────────────
  // NOTE: chrome.scripting.executeScript serializes ONLY the function it's
  // given — it does not carry along other functions from this closure. Each
  // function below must be fully self-contained (helpers duplicated inline).

  // AUTO-CREATES fields by clicking the add button, then fills them
  async function pageFillFields(values, labelPrefix) {
    function getAccessibleLabel(el) {
      const direct = el.getAttribute('aria-label');
      if (direct) return direct;
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        return labelledby
          .split(/\s+/)
          .map(id => document.getElementById(id)?.textContent || '')
          .join(' ')
          .trim();
      }
      return '';
    }
    function getMatchingFields() {
      return Array.from(document.querySelectorAll('input[type="text"], textarea')).filter(
        el => getAccessibleLabel(el).toLowerCase().startsWith(labelPrefix.toLowerCase())
      );
    }
    function setNativeValue(el, value) {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    }

    // How many new fields do we need to create?
    const currentCount = getMatchingFields().length;
    const needed       = values.length - currentCount;

    if (needed > 0) {
      const addBtn = document.querySelector(`[aria-label="Add ${labelPrefix}"]`);
      if (addBtn) {
        for (let i = 0; i < needed; i++) {
          addBtn.click();
          await new Promise(r => setTimeout(r, 200));
        }
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Fill all fields
    const fields = getMatchingFields();

    let filled = 0;
    for (let i = 0; i < fields.length && i < values.length; i++) {
      setNativeValue(fields[i], values[i]);
      fields[i].dispatchEvent(new Event('input',  { bubbles: true }));
      fields[i].dispatchEvent(new Event('change', { bubbles: true }));
      filled++;
    }

    return { filled, total: fields.length };
  }

  function pageCopyFields(labelPrefix) {
    function getAccessibleLabel(el) {
      const direct = el.getAttribute('aria-label');
      if (direct) return direct;
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        return labelledby
          .split(/\s+/)
          .map(id => document.getElementById(id)?.textContent || '')
          .join(' ')
          .trim();
      }
      return '';
    }
    return Array.from(document.querySelectorAll('input[type="text"], textarea'))
      .filter(el => getAccessibleLabel(el).toLowerCase().startsWith(labelPrefix.toLowerCase()))
      .map(field => field.value)
      .filter(v => v.trim() !== '');
  }

  function pageClearFields(labelPrefix) {
    function getAccessibleLabel(el) {
      const direct = el.getAttribute('aria-label');
      if (direct) return direct;
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        return labelledby
          .split(/\s+/)
          .map(id => document.getElementById(id)?.textContent || '')
          .join(' ')
          .trim();
      }
      return '';
    }
    function setNativeValue(el, value) {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    }

    const fields = Array.from(document.querySelectorAll('input[type="text"], textarea')).filter(
      el => getAccessibleLabel(el).toLowerCase().startsWith(labelPrefix.toLowerCase())
    );

    let cleared = 0;
    fields.forEach(field => {
      if (field.value.trim() !== '') {
        setNativeValue(field, '');
        field.dispatchEvent(new Event('input',  { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        cleared++;
      }
    });
    return cleared;
  }

  // ── Reusable Button Wiring ─────────────────────────────────
  function wireButtons(config) {
    const { textareaId, fillBtnId, copyBtnId, removeBtnId, statusId, labelPrefix } = config;

    document.getElementById(fillBtnId).addEventListener('click', async () => {
      const lines = document.getElementById(textareaId).value
        .split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length === 0) {
        showStatus(statusId, '⚠ Please enter at least one value.', 'error');
        return;
      }
      // Show a loading message while fields are being created
      showStatus(statusId, `⏳ Creating ${lines.length} field(s)...`, 'info');
      try {
        const result = await runScript(pageFillFields, [lines, labelPrefix]);
        if (result && result.total > 0) {
          showStatus(statusId, `✓ Filled ${result.filled} of ${result.total} field(s).`, 'success');
        } else {
          showStatus(statusId, '⚠ No matching fields found. Are you on the right page?', 'error');
        }
      } catch (e) {
        showStatus(statusId, '✗ Error: Make sure you are on a Google Ads editing page.', 'error');
      }
    });

    document.getElementById(copyBtnId).addEventListener('click', async () => {
      try {
        const values = await runScript(pageCopyFields, [labelPrefix]);
        if (!values || values.length === 0) {
          showStatus(statusId, '⚠ No filled fields found on page.', 'info');
          return;
        }
        const text = values.join('\n');
        document.getElementById(textareaId).value = text;
        document.getElementById(textareaId).dispatchEvent(new Event('input'));
        await navigator.clipboard.writeText(text);
        showStatus(statusId, `✓ Copied ${values.length} value(s) to clipboard & textarea.`, 'success');
      } catch (e) {
        showStatus(statusId, '✗ Error copying. Check page permissions.', 'error');
      }
    });

    document.getElementById(removeBtnId).addEventListener('click', async () => {
      try {
        const cleared = await runScript(pageClearFields, [labelPrefix]);
        showStatus(statusId, `✓ Cleared ${cleared} field(s).`, 'success');
      } catch (e) {
        showStatus(statusId, '✗ Error clearing fields.', 'error');
      }
    });
  }

  // ── Wire All Three Tabs ────────────────────────────────────
  wireButtons({
    textareaId:  'headlinesInput',
    fillBtnId:   'fillHeadlinesBtn',
    copyBtnId:   'copyHeadlinesBtn',
    removeBtnId: 'removeHeadlinesBtn',
    statusId:    'headlineStatus',
    labelPrefix: 'Headline'
  });

  wireButtons({
    textareaId:  'longHeadlinesInput',
    fillBtnId:   'fillLongHeadlinesBtn',
    copyBtnId:   'copyLongHeadlinesBtn',
    removeBtnId: 'removeLongHeadlinesBtn',
    statusId:    'longHeadlineStatus',
    labelPrefix: 'Long headline'
  });

  wireButtons({
    textareaId:  'descriptionsInput',
    fillBtnId:   'fillDescriptionsBtn',
    copyBtnId:   'copyDescriptionsBtn',
    removeBtnId: 'removeDescriptionsBtn',
    statusId:    'descriptionStatus',
    labelPrefix: 'Description'
  });

});