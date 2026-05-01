import { getConfig, getMetadata, loadArea } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const HEADER_PATH = '/fragments/nav/header';
/** Shipped alone so live sites with a 3-row header fragment can still load the utility bar */
const HEADER_UTILITY_PATH = '/fragments/nav/header-utility.plain.html';

/**
 * Published `header.plain.html` on AEM sometimes omits the top utility row (Quick Order, etc.).
 * Detect the 3-block shape that starts with the logo row and prepend utility HTML when available.
 * @param {HTMLElement[]} bodyDivs Direct children of parsed fragment body
 * @returns {boolean}
 */
function shouldPrependUtilityBar(bodyDivs) {
  if (bodyDivs.length !== 3) return false;
  const first = bodyDivs[0];
  const text = first.textContent.toLowerCase();
  if (text.includes('quick order') || text.includes('order status') || text.includes('help center')) {
    return false;
  }
  return Boolean(first.querySelector('picture, img'));
}

async function mergeUtilityBarIfNeeded(bodyDivs, localePrefix) {
  if (!shouldPrependUtilityBar(bodyDivs)) return bodyDivs;
  const url = `${localePrefix}${HEADER_UTILITY_PATH}`;
  const utilResp = await fetch(url);
  if (!utilResp.ok) return bodyDivs;
  const udoc = new DOMParser().parseFromString(await utilResp.text(), 'text/html');
  const utilityDivs = [...udoc.querySelectorAll(':scope > body > div')];
  if (!utilityDivs.length) return bodyDivs;
  return [...utilityDivs, ...bodyDivs];
}

/** Inline SVGs for login row (profile + dropdown affordance) */
const ICON_ACCOUNT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>`;

const ICON_CHEVRON_DOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="header-login-chevron-icon" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;

/**
 * Match commerce header pattern: profile glyph + label + chevron.
 * @param {HTMLAnchorElement} a
 */
function decorateLoginRegisterLink(a) {
  const label = a.textContent.replace(/\s+/g, ' ').trim();
  a.classList.add('header-login-link');
  a.innerHTML = `<span class="header-login-account">${ICON_ACCOUNT_SVG}</span><span class="header-login-label">${label}</span><span class="header-login-chevron">${ICON_CHEVRON_DOWN_SVG}</span>`;
}

/**
 * Cart icon + circular badge with item count.
 * @param {HTMLAnchorElement} a
 */
function decorateCartControlsLink(a) {
  const m = a.textContent.match(/(\d+)/);
  const count = m ? m[1] : '0';
  const iconHolder = a.querySelector('.icon');
  const svgMarkup = iconHolder ? iconHolder.outerHTML : '';
  a.classList.add('header-cart-link');
  a.innerHTML = `<span class="header-cart-icon">${svgMarkup}</span><span class="header-cart-badge">${count}</span>`;
}

/**
 * Remove stray fragment rows when Hamburger is injected by decorateHeader.
 * @param {HTMLUListElement} ul
 */
function stripUtilityDuplicateNavTriggers(ul) {
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const toggleLink = li.querySelector('a[href*="toggle"], a[href*="widgets/toggle"]');
    const ham = li.querySelector('.icon-hamburger');
    if (toggleLink || ham) li.remove();
  });
}

async function loadSvgIcons(container) {
  const icons = container.querySelectorAll('.icon');
  for (const icon of icons) {
    const classList = Array.from(icon.classList);
    const iconName = classList.find((c) => c.startsWith('icon-') && c !== 'icon')?.replace('icon-', '');
    if (iconName) {
      try {
        const resp = await fetch(`/icons/${iconName}.svg`);
        if (resp.ok) {
          const svg = await resp.text();
          const span = document.createElement('span');
          span.className = icon.className;
          span.innerHTML = svg;
          icon.replaceWith(span);
        }
      } catch (e) { /* icon not found */ }
    }
  }
}

function buildSlideOutNav(navSection) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';

  // Header row: "Main Menu" + close button
  const panelHeader = document.createElement('div');
  panelHeader.className = 'nav-panel-header';
  const title = document.createElement('span');
  title.className = 'nav-panel-title';
  title.textContent = 'Main Menu';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'nav-panel-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  panelHeader.append(title, closeBtn);
  panel.append(panelHeader);

  // Nav items from the nav section
  const navList = navSection.querySelector('ul');
  if (navList) {
    const clonedList = navList.cloneNode(true);
    clonedList.className = 'nav-panel-list';
    // Add chevron arrows to items that have dropdowns
    clonedList.querySelectorAll(':scope > li').forEach((li) => {
      const link = li.querySelector('a');
      if (link) {
        const item = document.createElement('div');
        item.className = 'nav-panel-item';
        const label = document.createElement('span');
        label.textContent = link.textContent.trim();
        item.append(label);
        // Add chevron for items with sub-menus (all except Services)
        const hasSubmenu = li.querySelector('ul');
        if (hasSubmenu) {
          const chevron = document.createElement('span');
          chevron.className = 'nav-panel-chevron';
          chevron.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
          item.append(chevron);
        }
        li.innerHTML = '';
        li.append(item);
      }
    });
    panel.append(clonedList);
  }

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';

  // Close handlers
  const close = () => {
    panel.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  return { panel, overlay };
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');

  let topnavSection;
  let brandSection;
  let navSection;
  let actionsSection;

  if (sections.length >= 4) {
    [topnavSection, brandSection, navSection, actionsSection] = sections;
  } else {
    [brandSection, navSection, actionsSection] = sections;
  }

  // Decorate top nav
  if (topnavSection) {
    topnavSection.classList.add('topnav-section', 'global-utility-nav');
    await loadSvgIcons(topnavSection);
  }

  // Decorate brand
  if (brandSection) {
    brandSection.classList.add('brand-section');
    const brandLink = brandSection.querySelector('a');
    if (brandLink) {
      const textNodes = Array.from(brandLink.childNodes)
        .filter((n) => n.nodeType === 3 && n.textContent.trim());
      textNodes.forEach((t) => {
        const span = document.createElement('span');
        span.className = 'brand-text';
        span.textContent = t.textContent;
        t.replaceWith(span);
      });
    }
  }

  // Primary site links (Specialties, Products, …) — slide-out on all breakpoints
  if (navSection) {
    navSection.classList.add('main-nav-section');
  }

  // Decorate actions (Login, Cart)
  if (actionsSection) {
    actionsSection.classList.add('actions-section');
    await loadSvgIcons(actionsSection);
  }

  // Build search bar + actions into the brand row
  if (brandSection) {
    const brandContent = brandSection.querySelector('.default-content');
    if (brandContent) {
      // Search bar
      const searchForm = document.createElement('div');
      searchForm.className = 'header-search';
      searchForm.innerHTML = `<input type="search" placeholder="Search"
        aria-label="Search"><button class="header-search-btn"
        aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"><circle cx="11"
        cy="11" r="8"/><line x1="21" y1="21" x2="16.65"
        y2="16.65"/></svg></button>`;
      brandContent.append(searchForm);

      // Move actions into the brand row
      if (actionsSection) {
        const actionsList = actionsSection.querySelector('ul');
        if (actionsList) {
          const actionsBar = document.createElement('div');
          actionsBar.className = 'header-actions-bar';
          const actionsUl = actionsList.cloneNode(true);
          stripUtilityDuplicateNavTriggers(actionsUl);
          const loginLink = actionsUl.querySelector('a[href*="login-registration"], a[href*="login"]');
          if (loginLink) decorateLoginRegisterLink(loginLink);
          const cartLink = actionsUl.querySelector('a[href*="shopping-cart"], a[href*="cart"]');
          if (cartLink) decorateCartControlsLink(cartLink);
          actionsBar.append(actionsUl);
          brandContent.append(actionsBar);
        }
        actionsSection.remove();
      }
    }
  }

  // Build hamburger button + slide-out nav
  if (navSection) {
    const { panel, overlay } = buildSlideOutNav(navSection);
    fragment.append(panel, overlay);

    // Create hamburger button in the brand section (before logo)
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn';
    hamburgerBtn.setAttribute('aria-label', 'Open menu');
    hamburgerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

    hamburgerBtn.addEventListener('click', () => {
      panel.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    // Insert hamburger before the brand section's content
    const brandContent = brandSection.querySelector('.default-content');
    if (brandContent) {
      brandContent.prepend(hamburgerBtn);
    }
  }
}

export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  const { locale } = getConfig();
  try {
    let fragment;
    const plainResp = await fetch(`${locale.prefix}${path}.plain.html`);
    if (plainResp.ok) {
      const html = await plainResp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      let pageSections = [...doc.querySelectorAll(':scope > body > div')];
      pageSections = await mergeUtilityBarIfNeeded(pageSections, locale.prefix);
      fragment = document.createElement('div');
      fragment.classList.add('fragment-content');
      fragment.append(...pageSections);
      await loadArea({ area: fragment });
    } else {
      fragment = await loadFragment(`${locale.prefix}${path}`);
    }
    fragment.classList.add('header-content');
    await decorateHeader(fragment);
    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
