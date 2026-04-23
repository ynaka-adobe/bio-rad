/**
 * Checks if experimentation is enabled.
 * @returns {boolean} True if experimentation is enabled, false otherwise.
 */
const isExperimentationEnabled = () => document.head.querySelector('[name^="experiment"],[name^="campaign-"],[name^="audience-"],[property^="campaign:"],[property^="audience:"]')
  || [...document.querySelectorAll('.section-metadata div')].some((d) => d.textContent.match(/Experiment|Campaign|Audience/i));

/**
 * When true, chains OneTrust {@code OptanonWrapper} and maps cookie groups to
 * {@code updateUserConsent}. Validate C0003/C0004 (or your groups) with privacy/legal.
 * @see https://github.com/adobe/aem-experimentation/blob/v2/documentation/experiments.md#consent-based-experiments
 */
const INTEGRATE_ONETRUST_FOR_EXPERIMENTS = false;

/** When true, listens for Cookiebot consent events and calls {@code updateUserConsent}. */
const INTEGRATE_COOKIEBOT_FOR_EXPERIMENTS = false;

/**
 * Bridges consent platforms to the experimentation runtime. Must run before {@code loadEager}
 * so experiments with "Experiment Requires Consent" can see the latest choice.
 * @param {(consented: boolean) => void} updateUserConsent From aem-experimentation
 */
function initConsent(updateUserConsent) {
  document.addEventListener('consent-updated', (event) => {
    updateUserConsent(Boolean(event.detail?.experimentation));
  });

  if (INTEGRATE_ONETRUST_FOR_EXPERIMENTS) {
    const previous = typeof window.OptanonWrapper === 'function' ? window.OptanonWrapper : null;
    window.OptanonWrapper = function optanonWrapper() {
      if (previous) previous.apply(this, arguments);
      const groups = (window.OnetrustActiveGroups || '').split(',').filter(Boolean);
      const hasConsent = groups.includes('C0003') || groups.includes('C0004');
      updateUserConsent(hasConsent);
    };
    window.OptanonWrapper();
    return;
  }

  if (INTEGRATE_COOKIEBOT_FOR_EXPERIMENTS) {
    const onCookiebot = () => {
      const c = window.Cookiebot?.consent || {};
      updateUserConsent(Boolean(c.preferences || c.marketing));
    };
    window.addEventListener('CookiebotOnConsentReady', onCookiebot);
    window.addEventListener('CookiebotOnAccept', onCookiebot);
    onCookiebot();
  }
}

/**
 * Call from your CMP or tag manager when the user accepts or revokes experimentation-related consent.
 * @param {boolean} consented Whether experimentation may run
 */
export async function notifyExperimentationConsent(consented) {
  const { updateUserConsent } = await import('../plugins/experimentation/src/index.js');
  updateUserConsent(consented);
}

/**
 * Loads the experimentation module (eager).
 * @param {Document} document The document object.
 * @param {Object} config The experimentation configuration.
 * @returns {Promise<void>} A promise that resolves when the experimentation module is loaded.
 */
export async function runExperimentation(document, config) {
  if (!isExperimentationEnabled()) {
    window.addEventListener('message', async (event) => {
      if (event.data?.type === 'hlx:experimentation-get-config') {
        event.source.postMessage({
          type: 'hlx:experimentation-config',
          config: { experiments: [], audiences: [], campaigns: [] },
          source: 'no-experiments',
        }, '*');
      }
    });
    return null;
  }

  try {
    const { loadEager, updateUserConsent } = await import(
      '../plugins/experimentation/src/index.js'
    );
    initConsent(updateUserConsent);
    return loadEager(document, config);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load experimentation module (eager):', error);
    return null;
  }
}
