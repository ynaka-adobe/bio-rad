import { getConfig, getMetadata, loadArea } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const { locale } = getConfig();
const HEADER_PATH = '/fragments/nav/header';

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
    topnavSection.classList.add('topnav-section');
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

  // Decorate nav (hidden by default, shown in slide-out panel)
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
          actionsBar.append(actionsList.cloneNode(true));
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
  try {
    let fragment;
    const plainResp = await fetch(`${locale.prefix}${path}.plain.html`);
    if (plainResp.ok) {
      const html = await plainResp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pageSections = doc.querySelectorAll(':scope > body > div');
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
