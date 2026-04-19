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
    const bgImage = element.querySelector("figure img, picture img, img");
    const heading = element.querySelector("h1");
    const description = element.querySelector(".banner-h1-text p, p");
    const ctaLink = element.querySelector('a[href]:not([href="javascript:void(0)"])');
    const cells = [];
    if (bgImage) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(bgImage);
      cells.push([imgFrag]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    if (ctaLink) textFrag.appendChild(ctaLink);
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    const cells = [];
    const img = element.querySelector("img");
    const contentCol = [];
    const heading = element.querySelector("h2");
    if (heading) contentCol.push(heading);
    const paragraphs = element.querySelectorAll("p");
    paragraphs.forEach((p) => {
      if (p.textContent.trim()) contentCol.push(p);
    });
    const cta = element.querySelector('a[href="/p"], a[href*="/en-us/"]');
    if (cta && !contentCol.includes(cta.closest("p"))) contentCol.push(cta);
    const imageCol = img || "";
    if (contentCol.length > 0) cells.push([imageCol, contentCol]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse3(element, { document }) {
    const cells = [];
    const articles = element.querySelectorAll("article");
    articles.forEach((article) => {
      const link = article.querySelector("a[href]");
      if (!link) return;
      const img = article.querySelector("img");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) imgFrag.appendChild(img);
      const heading = article.querySelector("h3");
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = heading.textContent.trim();
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  function parse4(element, { document }) {
    const cells = [];
    const articles = element.querySelectorAll("article");
    articles.forEach((article) => {
      const img = article.querySelector("img");
      const badge = article.querySelector("em");
      const heading = article.querySelector("h2");
      const description = article.querySelector("p:not(:has(a))");
      const cta = article.querySelector("a[href]");
      const imageCol = img || "";
      const contentCol = [];
      if (badge) contentCol.push(badge);
      if (heading) contentCol.push(heading);
      if (description && description.textContent.trim()) contentCol.push(description);
      if (cta) contentCol.push(cta);
      if (contentCol.length > 0) cells.push([imageCol, contentCol]);
    });
    if (cells.length === 0) {
      const img = element.querySelector("img");
      const heading = element.querySelector("h2");
      const description = element.querySelector("p");
      const cta = element.querySelector("a[href]");
      const contentCol = [];
      if (heading) contentCol.push(heading);
      if (description) contentCol.push(description);
      if (cta) contentCol.push(cta);
      if (contentCol.length > 0) cells.push([img || "", contentCol]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse5(element, { document }) {
    const cells = [];
    const articles = element.querySelectorAll("article");
    articles.forEach((article) => {
      const link = article.querySelector("a[href]");
      if (!link) return;
      const img = article.querySelector("img");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) imgFrag.appendChild(img);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const category = article.querySelector("em");
      if (category) textFrag.appendChild(category);
      const heading = article.querySelector("h4, h3, h2");
      if (heading) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = heading.textContent.trim();
        const strong = document.createElement("strong");
        strong.appendChild(a);
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      const description = article.querySelector("p:not(:has(em)):not(:has(h4))");
      if (description && description.textContent.trim()) textFrag.appendChild(description);
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse6(element, { document }) {
    const cells = [];
    const articles = element.querySelectorAll("article");
    articles.forEach((article) => {
      const link = article.querySelector("a[href]");
      if (!link) return;
      const img = article.querySelector("img");
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      if (img) imgFrag.appendChild(img);
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const heading = article.querySelector("h3, h2");
      if (heading) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = heading.textContent.trim();
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      const description = article.querySelector(".promo-period-home, p");
      if (description && description.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = description.textContent.trim();
        textFrag.appendChild(p);
      }
      if (link.href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.textContent.trim() || "Learn More";
        p.appendChild(a);
        textFrag.appendChild(p);
      }
      cells.push([imgFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/biorad-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        '[class*="cookie"]',
        ".country_select",
        "#drift-widget"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Header and navigation
        "header",
        "#block-biorad-brcheadercomponentblock",
        ".top-bar-unstick",
        "#header-main-nav",
        "#header-login-menu2",
        // Footer
        "footer",
        "#footer-main",
        ".redesign-footer",
        // Other non-authorable
        "iframe",
        "link",
        "noscript",
        "script",
        ".visually-hidden",
        '[role="status"]'
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
        el.removeAttribute("data-drupal-selector");
      });
    }
  }

  // tools/importer/transformers/biorad-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== template.sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Bio-Rad US English homepage with hero content, product categories, and promotional sections",
    urls: [
      "https://www.bio-rad.com/en-us"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [".coh-container.background-banner"]
      },
      {
        name: "columns-feature",
        instances: [".home-featured-product"]
      },
      {
        name: "cards-category",
        instances: [".coh-container.home-popular-products"]
      },
      {
        name: "columns-product",
        instances: [".paragraph--type--featured-product"]
      },
      {
        name: "cards-news",
        instances: [".coh-container.home-recent-news"]
      },
      {
        name: "cards-promo",
        instances: [".coh-container.home-promotion-module"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".coh-container.background-banner",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Your Work Our Purpose",
        selector: ".home-featured-product",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Popular Product Categories",
        selector: ".coh-container.home-popular-products",
        style: null,
        blocks: ["cards-category"],
        defaultContent: ["h2", "a[href='/en-us/p']"]
      },
      {
        id: "section-4",
        name: "Featured Products",
        selector: ".paragraph--type--featured-product",
        style: null,
        blocks: ["columns-product"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Latest from Bio-Rad",
        selector: ".coh-container.home-recent-news",
        style: "light-gray",
        blocks: ["cards-news"],
        defaultContent: ["h2", "a[href='/en-us/nws']"]
      },
      {
        id: "section-6",
        name: "Promotions",
        selector: ".coh-container.home-promotion-module",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: ["h2", "a[href='/promotions']"]
      }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "columns-feature": parse2,
    "cards-category": parse3,
    "columns-product": parse4,
    "cards-news": parse5,
    "cards-promo": parse6
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
