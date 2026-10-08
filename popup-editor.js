// UI layer for the redesigned popup. Works alongside the original popup.js
// (which owns tab switching, page filling and status messages).
document.addEventListener('DOMContentLoaded', () => {

  // Line-numbered editor with per-line character counts
  function render(ta) {
    const max = +ta.dataset.max, cap = +ta.dataset.cap;
    const mirror = ta.parentElement.querySelector('.mirror');
    const editor = ta.closest('.editor');
    let n = 0, bad = 0;
    mirror.innerHTML = '';
    ta.value.split('\n').forEach(raw => {
      const line = document.createElement('div');
      line.className = 'ln';
      line.textContent = raw || '\u200b';
      const t = raw.trim();
      if (t) {
        n++;
        const extra = n > cap, over = !extra && t.length > max;
        if (over) { line.classList.add('over'); bad++; }
        else if (extra) line.classList.add('extra');
        else if (t.length >= max * 0.9) line.classList.add('near');
        const num = document.createElement('span');
        num.className = 'num'; num.textContent = n;
        const cnt = document.createElement('span');
        cnt.className = 'cnt'; cnt.textContent = extra ? 'extra' : `${t.length}/${max}`;
        line.append(num, cnt);
      }
      mirror.appendChild(line);
    });
    editor.classList.toggle('has-error', bad > 0);
    const badge = document.querySelector(`[data-badge="${ta.id}"]`);
    if (badge) {
      badge.textContent = `${Math.min(n, cap)}/${cap}`;
      badge.classList.toggle('bad', bad > 0);
    }
  }

  document.querySelectorAll('.textarea[data-max]').forEach(ta => {
    ta.addEventListener('input', () => render(ta));
    render(ta);
  });

  // Per-tab Paste / Clear (popup textarea only, not the page)
  document.querySelectorAll('[data-paste]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ta = document.getElementById(btn.dataset.paste);
      try {
        const text = await navigator.clipboard.readText();
        ta.value = text.replace(/\r/g, '').trim();
        ta.dispatchEvent(new Event('input'));
      } catch (e) { ta.focus(); }
    });
  });
  document.querySelectorAll('[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById(btn.dataset.clear);
      ta.value = '';
      ta.dispatchEvent(new Event('input'));
      ta.focus();
    });
  });

  // Page context chip
  const chip = document.getElementById('ctxChip');
  const label = document.getElementById('ctxLabel');
  if (window.chrome && chrome.tabs && chrome.tabs.query) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (chrome.runtime && chrome.runtime.lastError) return;
        const url = tabs && tabs[0] && tabs[0].url || '';
        const on = /^https:\/\/ads\.google\.com\//.test(url);
        if (chip) chip.classList.toggle('on', on);
        if (label) label.textContent = on ? 'On Google Ads' : 'Not on Google Ads';
      });
    } catch (e) {
      if (label) label.textContent = 'Not on Google Ads';
    }
  } else {
    if (label) label.textContent = 'Not on Google Ads';
  }
});
