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
    if (!el) return;
    el.textContent = message;
    el.className   = 'status ' + type;
    setTimeout(() => {
      el.textContent = '';
      el.className   = 'status';
    }, 3500);
  }

  function formatCombinedCopy(headlines, longHeadlines, descriptions) {
    const sections = [];
    const h = (Array.isArray(headlines) ? headlines : (headlines || '').split('\n')).map(s => s.trim()).filter(Boolean);
    const lh = (Array.isArray(longHeadlines) ? longHeadlines : (longHeadlines || '').split('\n')).map(s => s.trim()).filter(Boolean);
    const d = (Array.isArray(descriptions) ? descriptions : (descriptions || '').split('\n')).map(s => s.trim()).filter(Boolean);

    if (h.length > 0) {
      sections.push(`HEADLINES:\n${h.join('\n')}`);
    }
    if (lh.length > 0) {
      sections.push(`LONG HEADLINES:\n${lh.join('\n')}`);
    }
    if (d.length > 0) {
      sections.push(`DESCRIPTIONS:\n${d.join('\n')}`);
    }
    return sections.join('\n\n');
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback below
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }

  function flashButtonCopied(btn, originalHtml) {
    btn.classList.add('btn-copied');
    btn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      <span class="btn-text">Copied!</span>
    `;
    setTimeout(() => {
      btn.classList.remove('btn-copied');
      btn.innerHTML = originalHtml;
    }, 1800);
  }

  function flashButtonPasted(btn, originalHtml) {
    btn.classList.add('btn-pasted');
    btn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      <span class="btn-text">Pasted &amp; Filled!</span>
    `;
    setTimeout(() => {
      btn.classList.remove('btn-pasted');
      btn.innerHTML = originalHtml;
    }, 1800);
  }

  function parseClipboardText(text, hasLongHeadlines) {
    const trimmed = (text || '').trim();
    if (!trimmed) return { headlines: [], longHeadlines: [], descriptions: [] };

    // Check if text uses labeled section headers (HEADLINES:, LONG HEADLINES:, DESCRIPTIONS:)
    const hasSectionHeaders = /^(?:HEADLINES|LONG HEADLINES|DESCRIPTIONS)\s*:/im.test(trimmed);

    if (hasSectionHeaders) {
      let currentSection = 'headlines';
      const h = [];
      const lh = [];
      const d = [];

      const rawLines = trimmed.split('\n');
      for (const rawLine of rawLines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (/^HEADLINES\s*:/i.test(line)) {
          currentSection = 'headlines';
          const rest = line.replace(/^HEADLINES\s*:\s*/i, '').trim();
          if (rest) h.push(rest);
        } else if (/^LONG\s+HEADLINES?\s*:/i.test(line)) {
          currentSection = 'longHeadlines';
          const rest = line.replace(/^LONG\s+HEADLINES?\s*:/i, '').trim();
          if (rest) lh.push(rest);
        } else if (/^DESCRIPTIONS?\s*:/i.test(line)) {
          currentSection = 'descriptions';
          const rest = line.replace(/^DESCRIPTIONS?\s*:/i, '').trim();
          if (rest) d.push(rest);
        } else {
          if (currentSection === 'headlines') h.push(line);
          else if (currentSection === 'longHeadlines') lh.push(line);
          else if (currentSection === 'descriptions') d.push(line);
        }
      }

      return {
        headlines: h.slice(0, 15),
        longHeadlines: hasLongHeadlines ? lh.slice(0, 5) : [],
        descriptions: d.slice(0, hasLongHeadlines ? 5 : 4)
      };
    }

    // Sequential plain text lines (no headers)
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);

    if (hasLongHeadlines) {
      // With long headlines on page: first 15 headlines, next 5 long headlines, next up to 5 descriptions
      return {
        headlines: lines.slice(0, 15),
        longHeadlines: lines.slice(15, 20),
        descriptions: lines.slice(20, 25)
      };
    } else {
      // Without long headlines on page (RSA): first 15 headlines, next 4 descriptions
      let des = [];
      if (lines.length >= 24) {
        // 24+ lines provided (15H + 5LH + 4/5D) -> skip the 5 LH, take 4 descriptions
        des = lines.slice(20, 24);
      } else if (lines.length > 20) {
        des = lines.slice(20, 24);
        if (des.length === 0) des = lines.slice(15, 19);
      } else {
        // 19 or fewer lines (e.g. 15H + 4D)
        des = lines.slice(15, 19);
      }
      return {
        headlines: lines.slice(0, 15),
        longHeadlines: [],
        descriptions: des
      };
    }
  }

  async function runScript(func, args = []) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0 || !tabs[0].id) {
      throw new Error('No active tab found');
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
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

  function pageCopyAllFields() {
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

    const fields = Array.from(document.querySelectorAll('input[type="text"], textarea'));

    function extractByPrefix(prefix) {
      return fields
        .filter(el => getAccessibleLabel(el).toLowerCase().startsWith(prefix.toLowerCase()))
        .map(field => field.value)
        .filter(v => v.trim() !== '');
    }

    return {
      headlines: extractByPrefix('Headline'),
      longHeadlines: extractByPrefix('Long headline'),
      descriptions: extractByPrefix('Description')
    };
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

  function pageCheckCapabilities() {
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

    const fields = Array.from(document.querySelectorAll('input[type="text"], textarea'));
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));

    const hasLongHeadlineField = fields.some(el =>
      getAccessibleLabel(el).toLowerCase().startsWith('long headline')
    );
    const hasLongHeadlineBtn = buttons.some(b => {
      const lbl = (b.getAttribute('aria-label') || b.textContent || '').trim().toLowerCase();
      return lbl.includes('long headline');
    });

    const hasHeadlineField = fields.some(el =>
      getAccessibleLabel(el).toLowerCase().startsWith('headline')
    );
    const hasHeadlineBtn = buttons.some(b => {
      const lbl = (b.getAttribute('aria-label') || b.textContent || '').trim().toLowerCase();
      return lbl.includes('headline');
    });

    return {
      hasLongHeadlines: hasLongHeadlineField || hasLongHeadlineBtn,
      isAdsPage: hasHeadlineField || hasHeadlineBtn || hasLongHeadlineField || hasLongHeadlineBtn
    };
  }

  async function pageFillAllAssets(assets) {
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

    function getMatchingFields(labelPrefix) {
      return Array.from(document.querySelectorAll('input[type="text"], textarea')).filter(
        el => getAccessibleLabel(el).toLowerCase().startsWith(labelPrefix.toLowerCase())
      );
    }

    function setNativeValue(el, value) {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    }

    function findAddButton(labelPrefix) {
      const exact = document.querySelector(`[aria-label="Add ${labelPrefix}" i]`);
      if (exact) return exact;
      return Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
        const lbl = (b.getAttribute('aria-label') || b.textContent || '').trim().toLowerCase();
        return lbl === `add ${labelPrefix.toLowerCase()}`;
      }) || null;
    }

    async function fillSection(values, labelPrefix) {
      if (!values || values.length === 0) return { filled: 0, total: 0 };

      const currentCount = getMatchingFields(labelPrefix).length;
      const needed = values.length - currentCount;

      if (needed > 0) {
        const addBtn = findAddButton(labelPrefix);
        if (addBtn) {
          for (let i = 0; i < needed; i++) {
            addBtn.click();
            await new Promise(r => setTimeout(r, 200));
          }
          await new Promise(r => setTimeout(r, 300));
        }
      }

      const fields = getMatchingFields(labelPrefix);
      let filled = 0;
      for (let i = 0; i < fields.length && i < values.length; i++) {
        setNativeValue(fields[i], values[i]);
        fields[i].dispatchEvent(new Event('input',  { bubbles: true }));
        fields[i].dispatchEvent(new Event('change', { bubbles: true }));
        filled++;
      }
      return { filled, total: fields.length };
    }

    const hResult = await fillSection(assets.headlines || [], 'Headline');
    let lhResult = { filled: 0, total: 0 };
    if (assets.longHeadlines && assets.longHeadlines.length > 0) {
      lhResult = await fillSection(assets.longHeadlines, 'Long headline');
    }
    const dResult = await fillSection(assets.descriptions || [], 'Description');

    return {
      headlines: hResult,
      longHeadlines: lhResult,
      descriptions: dResult
    };
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

  // ── Quick Copy All Wiring ──────────────────────────────────
  const copyAllFromPageBtn = document.getElementById('copyAllFromPageBtn');

  if (copyAllFromPageBtn) {
    const origPageHtml = copyAllFromPageBtn.innerHTML;
    copyAllFromPageBtn.addEventListener('click', async () => {
      showStatus('quickStatus', '⏳ Extracting all assets from page...', 'info');
      try {
        const result = await runScript(pageCopyAllFields);
        const h  = result?.headlines || [];
        const lh = result?.longHeadlines || [];
        const d  = result?.descriptions || [];
        const total = h.length + lh.length + d.length;

        if (total === 0) {
          showStatus('quickStatus', '⚠ No filled fields found on page.', 'info');
          return;
        }

        // Populate all 3 textareas and trigger char count updates
        const hInput = document.getElementById('headlinesInput');
        hInput.value = h.join('\n');
        hInput.dispatchEvent(new Event('input'));

        const lhInput = document.getElementById('longHeadlinesInput');
        lhInput.value = lh.join('\n');
        lhInput.dispatchEvent(new Event('input'));

        const dInput = document.getElementById('descriptionsInput');
        dInput.value = d.join('\n');
        dInput.dispatchEvent(new Event('input'));

        const combinedText = formatCombinedCopy(h, lh, d);
        await copyToClipboard(combinedText);

        flashButtonCopied(copyAllFromPageBtn, origPageHtml);
        showStatus('quickStatus', `✓ Copied all from page (${h.length} H · ${lh.length} LH · ${d.length} D) to clipboard & tabs!`, 'success');
      } catch (e) {
        showStatus('quickStatus', '✗ Error: Make sure you are on a Google Ads editing page.', 'error');
      }
    });
  }

  // ── Quick Paste Wiring ─────────────────────────────────────
  const quickPasteBtn = document.getElementById('quickPasteBtn');

  if (quickPasteBtn) {
    const origPasteHtml = quickPasteBtn.innerHTML;
    quickPasteBtn.addEventListener('click', async () => {
      // 1. Read clipboard
      let clipboardText = '';
      try {
        clipboardText = await navigator.clipboard.readText();
      } catch (err) {
        showStatus('quickStatus', '✗ Could not read clipboard. Please check browser permissions.', 'error');
        return;
      }

      if (!clipboardText || !clipboardText.trim()) {
        showStatus('quickStatus', '⚠ Clipboard is empty. Please copy your ad copy first.', 'error');
        return;
      }

      showStatus('quickStatus', '⏳ Reading copy & checking page inputs...', 'info');

      // 2. Check whether Long Headlines inputs exist on page
      let hasLongHeadlines = false;
      let isAdsPage = false;
      try {
        const cap = await runScript(pageCheckCapabilities);
        if (cap) {
          hasLongHeadlines = Boolean(cap.hasLongHeadlines);
          isAdsPage = Boolean(cap.isAdsPage);
        }
      } catch (e) {
        isAdsPage = false;
        hasLongHeadlines = false;
      }

      // If not on an ads page, infer hasLongHeadlines if clipboard has 24+ lines
      if (!isAdsPage) {
        const rawNonEmpty = clipboardText.split('\n').map(l => l.trim()).filter(Boolean);
        hasLongHeadlines = rawNonEmpty.length >= 24;
      }

      // 3. Parse clipboard text
      const parsed = parseClipboardText(clipboardText, hasLongHeadlines);

      // 4. Populate popup textareas & trigger character counting
      const hInput = document.getElementById('headlinesInput');
      hInput.value = parsed.headlines.join('\n');
      hInput.dispatchEvent(new Event('input'));

      const lhInput = document.getElementById('longHeadlinesInput');
      lhInput.value = parsed.longHeadlines.join('\n');
      lhInput.dispatchEvent(new Event('input'));

      const dInput = document.getElementById('descriptionsInput');
      dInput.value = parsed.descriptions.join('\n');
      dInput.dispatchEvent(new Event('input'));

      // 5. If on Google Ads page, auto-fill page fields
      if (isAdsPage) {
        showStatus('quickStatus', '⏳ Auto-filling fields on page...', 'info');
        try {
          const result = await runScript(pageFillAllAssets, [parsed]);
          const hFilled = result?.headlines?.filled || 0;
          const lhFilled = result?.longHeadlines?.filled || 0;
          const dFilled = result?.descriptions?.filled || 0;
          const totalFilled = hFilled + lhFilled + dFilled;

          if (totalFilled > 0) {
            flashButtonPasted(quickPasteBtn, origPasteHtml);
            if (hasLongHeadlines) {
              showStatus('quickStatus', `✓ Filled page & tabs: ${hFilled} H · ${lhFilled} LH · ${dFilled} D!`, 'success');
            } else {
              showStatus('quickStatus', `✓ Filled page & tabs: ${hFilled} H · ${dFilled} D (RSA · No Long Headlines)!`, 'success');
            }
          } else {
            flashButtonPasted(quickPasteBtn, origPasteHtml);
            showStatus('quickStatus', '✓ Pasted into tabs! No editable fields found on page (open ad editor to fill).', 'info');
          }
        } catch (e) {
          flashButtonPasted(quickPasteBtn, origPasteHtml);
          showStatus('quickStatus', '✓ Pasted into tabs! Note: Error filling page fields.', 'info');
        }
      } else {
        // Not on active Google Ads editing page
        flashButtonPasted(quickPasteBtn, origPasteHtml);
        const lhNote = parsed.longHeadlines.length > 0 ? ` · ${parsed.longHeadlines.length} LH` : '';
        showStatus('quickStatus', `✓ Pasted into tabs (${parsed.headlines.length} H${lhNote} · ${parsed.descriptions.length} D). Open Google Ads to fill page.`, 'success');
      }
    });
  }

});