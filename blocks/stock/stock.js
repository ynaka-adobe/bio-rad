const FINNHUB_TOKEN = 'd832umpr01ql4ong3qqgd832umpr01ql4ong3qr0';
const CACHE_KEY = 'stock-block-cache';
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Get cached data or fetch new data
 */
async function getStockData(symbol = 'BIO') {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  const now = Date.now();

  // Return cached data if still valid
  if (cache.timestamp && (now - cache.timestamp) < CACHE_EXPIRY && cache.data) {
    return cache.data;
  }

  try {
    // Fetch quote data for the symbol
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: now,
      data: data,
    }));

    return data;
  } catch (error) {
    console.error('Stock data fetch error:', error);
    throw error;
  }
}

export default function decorate(block) {
  // Extract symbol from block content or use default
  const symbolText = block.textContent?.trim() || 'BIO';
  const symbol = symbolText.match(/[A-Z]+/) ? symbolText.match(/[A-Z]+/)[0] : 'BIO';

  // Create content container
  const content = document.createElement('div');
  content.className = 'stock-content';

  // Add loading state
  content.innerHTML = '<div class="stock-loading">Loading stock data...</div>';
  block.innerHTML = '';
  block.appendChild(content);

  // Fetch and display data
  getStockData(symbol)
    .then((data) => {
      if (!data || Object.keys(data).length === 0) {
        content.innerHTML = '<div class="stock-error">No data available for this symbol</div>';
        return;
      }

      const { c: price, h: high, l: low, o: open, pc: previousClose, t: timestamp } = data;

      const date = timestamp ? new Date(timestamp * 1000).toLocaleDateString() : new Date().toLocaleDateString();

      content.innerHTML = `
        <div class="stock-data">
          <h2 class="stock-symbol">${symbol}</h2>
          <p class="stock-price">$${price?.toFixed(2) || 'N/A'}</p>
          <p>Date: ${date}</p>
          ${open ? `<p>Open: $${open.toFixed(2)}</p>` : ''}
          ${high ? `<p>High: $${high.toFixed(2)}</p>` : ''}
          ${low ? `<p>Low: $${low.toFixed(2)}</p>` : ''}
          ${previousClose ? `<p>Previous Close: $${previousClose.toFixed(2)}</p>` : ''}
        </div>
      `;
    })
    .catch((error) => {
      content.innerHTML = `<div class="stock-error">Error loading stock data. Please try again later.</div>`;
      console.error('Stock block error:', error);
    });
}
