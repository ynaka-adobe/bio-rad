/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - All parsers for the homepage template
import heroBannerParser from './parsers/hero-banner.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsArticleParser from './parsers/cards-article.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import columnsLinksParser from './parsers/columns-links.js';
import cardsInfoParser from './parsers/cards-info.js';

// TRANSFORMER IMPORTS - All transformers for Cat.com
import catCleanupTransformer from './transformers/cat-cleanup.js';
import catSectionsTransformer from './transformers/cat-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Cat.com US English homepage with hero content, product categories, and promotional sections',
  urls: [
    'https://www.cat.com/en_US.html',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ["[data-component='teaser--hero']"],
    },
    {
      name: 'cards-category',
      instances: ["[data-component='list']"],
    },
    {
      name: 'cards-article',
      instances: ["[data-component='editorial-card']"],
    },
    {
      name: 'columns-feature',
      instances: [".offers-personalization [data-component='teaser']"],
    },
    {
      name: 'columns-links',
      instances: ['.hp-personalization-quick-links'],
    },
    {
      name: 'cards-info',
      instances: ['.hp-personalization-about'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.hp-personlization-teaser-hero',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Product Categories',
      selector: '.interactive-studio-content-spot',
      style: null,
      blocks: ['cards-category'],
      defaultContent: ["[data-component='title'] h2"],
    },
    {
      id: 'section-3',
      name: 'Featured Articles',
      selector: '.hp-personalization-articles',
      style: null,
      blocks: ['cards-article'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Feature Teaser',
      selector: '.offers-personalization',
      style: 'cat-yellow',
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Services & Support Grid',
      selector: '.hp-personalization-quick-links',
      style: 'light-gray',
      blocks: ['columns-links'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Info Cards',
      selector: '.hp-personalization-about',
      style: null,
      blocks: ['cards-info'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-category': cardsCategoryParser,
  'cards-article': cardsArticleParser,
  'columns-feature': columnsFeatureParser,
  'columns-links': columnsLinksParser,
  'cards-info': cardsInfoParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
const transformers = [
  catCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [catSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
