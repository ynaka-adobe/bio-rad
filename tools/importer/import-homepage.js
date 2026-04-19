/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - All parsers for the Bio-Rad homepage template
import heroBannerParser from './parsers/hero-banner.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsCategoryParser from './parsers/cards-category.js';
import columnsProductParser from './parsers/columns-product.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS - All transformers for Bio-Rad
import bioradCleanupTransformer from './transformers/biorad-cleanup.js';
import bioradSectionsTransformer from './transformers/biorad-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Bio-Rad US English homepage with hero content, product categories, and promotional sections',
  urls: [
    'https://www.bio-rad.com/en-us',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.coh-container.background-banner'],
    },
    {
      name: 'columns-feature',
      instances: ['.home-featured-product'],
    },
    {
      name: 'cards-category',
      instances: ['.coh-container.home-popular-products'],
    },
    {
      name: 'columns-product',
      instances: ['.paragraph--type--featured-product'],
    },
    {
      name: 'cards-news',
      instances: ['.coh-container.home-recent-news'],
    },
    {
      name: 'cards-promo',
      instances: ['.coh-container.home-promotion-module'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.coh-container.background-banner',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Your Work Our Purpose',
      selector: '.home-featured-product',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Popular Product Categories',
      selector: '.coh-container.home-popular-products',
      style: null,
      blocks: ['cards-category'],
      defaultContent: ['h2', "a[href='/en-us/p']"],
    },
    {
      id: 'section-4',
      name: 'Featured Products',
      selector: '.paragraph--type--featured-product',
      style: null,
      blocks: ['columns-product'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Latest from Bio-Rad',
      selector: '.coh-container.home-recent-news',
      style: 'light-gray',
      blocks: ['cards-news'],
      defaultContent: ['h2', "a[href='/en-us/nws']"],
    },
    {
      id: 'section-6',
      name: 'Promotions',
      selector: '.coh-container.home-promotion-module',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['h2', "a[href='/promotions']"],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-feature': columnsFeatureParser,
  'cards-category': cardsCategoryParser,
  'columns-product': columnsProductParser,
  'cards-news': cardsNewsParser,
  'cards-promo': cardsPromoParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
const transformers = [
  bioradCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [bioradSectionsTransformer] : []),
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
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
