var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const cells = [];
    const img = element.querySelector("figure img, img.lazyload, img[data-src]");
    if (img) {
      if (!img.src && img.dataset.src) img.src = img.dataset.src;
      cells.push([img]);
    }
    const contentCell = [];
    const heading = element.querySelector("h2.teaserHeading, h2, h1");
    if (heading) contentCell.push(heading);
    const description = element.querySelector('p.teaser-blog-content, p:not(.teaser-date):not([style*="display: none"])');
    if (description && description.textContent.trim()) contentCell.push(description);
    const cta = element.querySelector('a.button, a.teaserDefaultButtonText, a[class*="button"]');
    if (cta) {
      cta.querySelectorAll("i, .material-icons").forEach((icon) => icon.remove());
      contentCell.push(cta);
    }
    if (contentCell.length > 0) cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse2(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(".list__item, li.list-item, .list__list-col a");
    const links = items.length > 0 ? items : element.querySelectorAll("a[href]");
    links.forEach((item) => {
      const img = item.querySelector("img, picture img");
      const linkEl = item.tagName === "A" ? item : item.querySelector("a");
      if (!linkEl) return;
      if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
      const row = [];
      if (img) row.push(img);
      const label = linkEl.textContent.trim();
      if (label) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = linkEl.href;
        a.textContent = label;
        p.append(a);
        row.push(p);
      }
      if (row.length > 0) cells.push(row);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse3(element, { document }) {
    const cells = [];
    const cards = element.querySelectorAll(".editorial-card__item");
    cards.forEach((card) => {
      const img = card.querySelector("img, img.lazyload");
      const heading = card.querySelector('h2, h3, [id="defaultHeadlineText"]');
      const description = card.querySelector(".inner__right p, .editorial-card__item--text-wrap p");
      const link = card.querySelector("a[href]");
      if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
      const imageCell = img ? img : "";
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (description && description.textContent.trim()) contentCell.push(description);
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim() || (heading == null ? void 0 : heading.textContent.trim()) || "Read more";
        p.append(a);
        contentCell.push(p);
      }
      if (contentCell.length > 0) cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse4(element, { document }) {
    const cells = [];
    const teaser = element.querySelector('[data-component="teaser"]') || element;
    const contentCol = [];
    const heading = teaser.querySelector("h2.teaserHeading, h2, h1");
    if (heading) contentCol.push(heading);
    const description = teaser.querySelector("p.teaser-blog-content, .teaser__text-wrap p:not(.teaser-date)");
    if (description && description.textContent.trim()) contentCol.push(description);
    const cta = teaser.querySelector('a.button, a[class*="button"]');
    if (cta) {
      cta.querySelectorAll("i, .material-icons").forEach((icon) => icon.remove());
      contentCol.push(cta);
    }
    const img = teaser.querySelector("figure img, .teaser__img-wrap img, img.lazyload");
    if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
    const imageCol = img || "";
    if (contentCol.length > 0) cells.push([contentCol, imageCol]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-links.js
  function parse5(element, { document }) {
    const cells = [];
    const columnGroups = element.querySelectorAll(":scope > .aem-Grid > .responsivegrid.hp-personalization-quick-links");
    const groups = columnGroups.length > 0 ? columnGroups : [element];
    const row = [];
    groups.forEach((group) => {
      const col = [];
      const heading = group.querySelector('[data-component="title"] h2, .title h2, h2');
      if (heading) col.push(heading);
      const teasers = group.querySelectorAll('[data-component="teaser"]');
      if (teasers.length > 0) {
        const ul = document.createElement("ul");
        teasers.forEach((teaser) => {
          const link = teaser.querySelector('a.button, a[class*="button"], a[href]');
          if (link) {
            link.querySelectorAll("i, .material-icons").forEach((icon) => icon.remove());
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.textContent.trim();
            li.append(a);
            ul.append(li);
          }
        });
        if (ul.children.length > 0) col.push(ul);
      }
      if (col.length > 0) row.push(col);
    });
    if (row.length > 0) cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-info.js
  function parse6(element, { document }) {
    const cells = [];
    const teasers = element.querySelectorAll('[data-component="teaser"]');
    teasers.forEach((teaser) => {
      const img = teaser.querySelector("figure img, img.lazyload, img[data-src]");
      const heading = teaser.querySelector("h2.teaserHeading, h2");
      const description = teaser.querySelector("p.teaser-blog-content, .teaser__text-wrap p:not(.teaser-date)");
      const cta = teaser.querySelector('a.button, a[class*="button"]');
      if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
      const imageCell = img || "";
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (description && description.textContent.trim()) contentCell.push(description);
      if (cta) {
        cta.querySelectorAll("i, .material-icons").forEach((icon) => icon.remove());
        contentCell.push(cta);
      }
      if (contentCell.length > 0) cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-info", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/cat-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="cookie"]',
        ".tfn.floating-system-notification",
        ".skip-to-content",
        ".skip-search-crawl",
        "iframe"
      ]);
      element.querySelectorAll('input[type="hidden"]').forEach((el) => el.remove());
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        '[role="contentinfo"]',
        "nav",
        ".dealerLocator",
        ".dealers",
        ".bottom-nav",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("data-analytics");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/cat-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const { document } = payload;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) return;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (section.id !== "section-1") {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Cat.com US English homepage with hero content, product categories, and promotional sections",
    urls: [
      "https://www.cat.com/en_US.html"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: ["[data-component='teaser--hero']"]
      },
      {
        name: "cards-category",
        instances: ["[data-component='list']"]
      },
      {
        name: "cards-article",
        instances: ["[data-component='editorial-card']"]
      },
      {
        name: "columns-feature",
        instances: [".offers-personalization [data-component='teaser']"]
      },
      {
        name: "columns-links",
        instances: [".hp-personalization-quick-links"]
      },
      {
        name: "cards-info",
        instances: [".hp-personalization-about"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".hp-personlization-teaser-hero",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Product Categories",
        selector: ".interactive-studio-content-spot",
        style: null,
        blocks: ["cards-category"],
        defaultContent: ["[data-component='title'] h2"]
      },
      {
        id: "section-3",
        name: "Featured Articles",
        selector: ".hp-personalization-articles",
        style: null,
        blocks: ["cards-article"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Feature Teaser",
        selector: ".offers-personalization",
        style: "cat-yellow",
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Services & Support Grid",
        selector: ".hp-personalization-quick-links",
        style: "light-gray",
        blocks: ["columns-links"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Info Cards",
        selector: ".hp-personalization-about",
        style: null,
        blocks: ["cards-info"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "cards-category": parse2,
    "cards-article": parse3,
    "columns-feature": parse4,
    "columns-links": parse5,
    "cards-info": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
