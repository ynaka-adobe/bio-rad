// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const $ = (sel, root = document) => root.querySelector(sel);

const TEMPLATES = [
  {
    title: 'CAT Dealer Digital Experience Platform',
    description: 'Use Cat provided templates.',
    url: 'https://github.com/ynaka-adobe/cat',
  },
  {
    title: 'CAT Dealer Digital Experience w/ Personalization',
    description: 'Create your own Cat provided Repo to enable custom block creation and personalization.',
    url: 'https://github.com/ynaka-adobe/cat-dealer',
  },
  {
    title: 'CAT Dealer Kit for Platform',
    description: 'Hooks to subscribe to CAT content.',
    url: 'https://github.com/aemsites/author-kit',
  },
];

const CODE_SYNC_HREF = 'https://da.live/bot';
const DEFAULT_PRESET_CODEBASE_URL = 'https://github.com/cat-org/cat-dxp';
const CUSTOM_CODEBASE_SELECT_VALUE = '__custom__';

/** Outside DA, DA_SDK may never resolve; avoid hanging a hidden page forever. */
const DA_SDK_TIMEOUT_MS = 5000;
const CONTEXT_FALLBACK = { org: 'local-dev', repo: 'preview' };

async function resolveDaContext() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('DA_SDK timeout')), DA_SDK_TIMEOUT_MS);
  });
  try {
    const sdk = await Promise.race([DA_SDK, timeout]);
    return { org: sdk.context.org, repo: sdk.context.repo, fromDa: true };
  } catch {
    return { ...CONTEXT_FALLBACK, fromDa: false };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function isValidRepoUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();
    return host === 'github.com' || host.endsWith('.github.com');
  } catch {
    return false;
  }
}

function renderMain({
  org, repo, phase, codebaseUrl, codebaseMode = 'preset', dealerName = '', err, fromDa,
}) {
  const app = $('#app');
  if (err) {
    app.innerHTML = `
      <div class="sc-backdrop" aria-hidden="true"></div>
      <div class="sc-error" role="alert">${err}</div>
    `;
    return;
  }

  const step1Hidden = phase === 2 ? 'sc-hidden' : '';
  const step2Hidden = phase === 1 ? 'sc-hidden' : '';

  const step1Class = (n) => {
    if (phase === 1 && n === 1) return 'sc-step sc-step-active';
    if (phase === 2 && n === 1) return 'sc-step sc-step-done';
    if (phase === 2 && n === 2) return 'sc-step sc-step-active';
    return 'sc-step';
  };

  const cardsHtml = TEMPLATES.map((t) => `
    <button type="button" class="sc-card" data-template-url="${escapeAttr(t.url)}">
      <span class="sc-card-title">${t.title}</span>
      <span class="sc-card-desc">${t.description}</span>
    </button>
  `).join('');

  app.innerHTML = `
    <div class="sc-backdrop" aria-hidden="true"></div>
    <div class="sc-shell">
      <div class="sc-panel">
        ${fromDa === false ? `
        <p class="sc-dev-hint" role="status">
          Preview mode: not inside Document Authoring &mdash; using sample org/site. Open this tool from DA for your real context.
        </p>` : ''}
        <div class="sc-steps" aria-label="Progress">
          <div class="${step1Class(1)}" aria-current="${phase === 1 ? 'step' : 'false'}">1</div>
          <div class="sc-step-connector" aria-hidden="true"></div>
          <div class="${step1Class(2)}" aria-current="${phase === 2 ? 'step' : 'false'}">2</div>
        </div>

        <div class="sc-block ${step1Hidden}">
          <label class="sc-label" for="sc-dealer-name">Dealer Name</label>
          <div class="sc-input-row sc-input-row-text">
            <input
              id="sc-dealer-name"
              type="text"
              name="dealerName"
              autocomplete="organization"
              placeholder="e.g. Acme Cat"
              value="${escapeAttr(dealerName)}"
            />
          </div>
        </div>

        <div class="sc-block ${step1Hidden}">
          <label class="sc-label" for="sc-codebase-preset">Caterpillar Code options</label>
          <div class="sc-input-row">
            <select id="sc-codebase-preset" class="sc-select" name="codebase-preset" aria-controls="sc-custom-repo-wrap">
              <option
                value="${escapeAttr(DEFAULT_PRESET_CODEBASE_URL)}"
                ${codebaseMode === 'preset' ? 'selected' : ''}
              >${escapeHtml(DEFAULT_PRESET_CODEBASE_URL)}</option>
              <option
                value="${escapeAttr(CUSTOM_CODEBASE_SELECT_VALUE)}"
                ${codebaseMode === 'custom' ? 'selected' : ''}
              >Use your own Git</option>
            </select>
            <button type="button" class="sc-go" id="sc-go">Go</button>
          </div>
          <div id="sc-custom-repo-wrap" class="sc-custom-repo-wrap ${codebaseMode === 'custom' ? '' : 'sc-hidden'}">
            <label class="sc-sr-only" for="sc-repo-url">Custom repository URL</label>
            <div class="sc-input-row sc-input-row-custom">
              <input
                id="sc-repo-url"
                type="url"
                name="repo"
                autocomplete="url"
                placeholder="https://github.com/org/repo"
                value="${codebaseMode === 'custom' ? escapeAttr(codebaseUrl) : ''}"
              />
            </div>
          </div>
          <p class="sc-hint">
            Choose the Cat DXP codebase or your own GitHub repo. You can also pick a starter template below to fill a custom URL.
          </p>
        </div>

        <div class="sc-cards ${step1Hidden}" role="group" aria-label="Starter templates">
          ${cardsHtml}
        </div>

        <div class="sc-step2 ${step2Hidden}">
          <h2>Codebase ready</h2>
          <p>
            You&rsquo;re set to use <strong>${escapeHtml(codebaseUrl)}</strong> as your starting point.
            Continue in Document Authoring with your org and site, then wire up sync from GitHub.
          </p>
          <p class="sc-meta">Dealer name: <strong>${dealerName.trim() ? escapeHtml(dealerName.trim()) : '—'}</strong></p>
          <p class="sc-meta">Context: <code>${org}</code> / <code>${repo}</code></p>
          <div class="sc-actions">
            <button type="button" class="sc-btn-secondary" id="sc-back">Back</button>
          </div>
        </div>
      </div>
    </div>
    <footer class="sc-footer">
      Don&rsquo;t forget to add the
      <a href="${CODE_SYNC_HREF}" target="_blank" rel="noopener noreferrer">AEM Code Sync App</a>
      to your repository.
    </footer>
  `;

  const dealerInput = $('#sc-dealer-name');
  const preset = $('#sc-codebase-preset');
  const customWrap = $('#sc-custom-repo-wrap');
  const input = $('#sc-repo-url');
  const go = $('#sc-go');
  const back = $('#sc-back');

  function isCustomMode() {
    return preset?.value === CUSTOM_CODEBASE_SELECT_VALUE;
  }

  function readResolvedCodebaseUrl() {
    if (!preset) return '';
    if (!isCustomMode()) return preset.value;
    return (input?.value || '').trim();
  }

  function syncCustomRowVisibility() {
    if (!customWrap || !preset) return;
    customWrap.classList.toggle('sc-hidden', !isCustomMode());
  }

  preset?.addEventListener('change', () => {
    syncCustomRowVisibility();
    input?.setCustomValidity('');
  });

  go?.addEventListener('click', () => {
    const custom = isCustomMode();
    const next = readResolvedCodebaseUrl();
    if (custom) {
      if (!isValidRepoUrl(next)) {
        input?.focus();
        input?.setCustomValidity('Enter a valid GitHub repository URL (https://github.com/…)');
        input?.reportValidity();
        return;
      }
      input?.setCustomValidity('');
    }
    renderMain({
      org,
      repo,
      phase: 2,
      codebaseUrl: next,
      codebaseMode: custom ? 'custom' : 'preset',
      dealerName: (dealerInput?.value || '').trim(),
      err: null,
      fromDa,
    });
  });

  dealerInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      go?.click();
    }
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      go?.click();
    }
  });

  input?.addEventListener('input', () => {
    input.setCustomValidity('');
  });

  back?.addEventListener('click', () => {
    renderMain({
      org,
      repo,
      phase: 1,
      codebaseUrl,
      codebaseMode,
      dealerName,
      err: null,
      fromDa,
    });
  });

  app.querySelectorAll('.sc-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-template-url');
      if (!url || !preset || !input) return;
      preset.value = CUSTOM_CODEBASE_SELECT_VALUE;
      syncCustomRowVisibility();
      input.value = url;
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
}

async function init() {
  try {
    const { org, repo, fromDa } = await resolveDaContext();
    renderMain({
      org,
      repo,
      phase: 1,
      codebaseUrl: DEFAULT_PRESET_CODEBASE_URL,
      codebaseMode: 'preset',
      dealerName: '',
      err: null,
      fromDa,
    });
  } catch (e) {
    const app = $('#app');
    app.innerHTML = `
      <div class="sc-backdrop" aria-hidden="true"></div>
      <div class="sc-error" role="alert">${escapeHtml(e.message || 'Failed to load Document Authoring context.')}</div>
    `;
  }
}

init();
