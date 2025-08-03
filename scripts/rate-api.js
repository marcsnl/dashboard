//--------------- API logic ---------------

const apiEndpoints = {
  crypto: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=php&ids=bitcoin,ethereum,tether,ripple,binancecoin,solana,dogecoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
  forex: 'https://open.er-api.com/v6/latest/USD'
};

async function fetchPrices() {
  const cryptoList = document.getElementById('crypto-list');
  const forexList = document.getElementById('forex-list');
  cryptoList.innerHTML = '<tr><td colspan="4" class="error">Loading...</td></tr>';
  forexList.innerHTML = '<tr><td colspan="2" class="error">Loading...</td></tr>';

  try {
    const [cryptoRes, forexRes] = await Promise.all([
      fetch(apiEndpoints.crypto).then(res => res.json()),
      fetch(apiEndpoints.forex).then(res => res.json())
    ]);

    if (!Array.isArray(cryptoRes) || cryptoRes.length === 0) {
      throw new Error('Invalid crypto data');
    }
    if (forexRes.result !== 'success' || !forexRes.rates) {
      throw new Error('Invalid forex data');
    }

    console.log('CoinGecko API Response:', cryptoRes);
    console.log('ExchangeRate-API Response:', forexRes);

    displayPrices(cryptoRes, forexRes);
  } catch (error) {
    console.error('Error fetching prices:', error);
    cryptoList.innerHTML = '<tr><td colspan="4" class="error">Failed to load crypto prices. Please try again later.</td></tr>';
    forexList.innerHTML = '<tr><td colspan="2" class="error">Failed to load forex rates. Please try again later.</td></tr>';
  }
}

function displayPrices(crypto, forex) {
  const cryptoList = document.getElementById('crypto-list');
  cryptoList.innerHTML = '';

  const sortedCryptos = crypto.sort((a, b) => b.current_price - a.current_price);
  for (const coin of sortedCryptos) {
    const formatPercentage = (value) => {
      if (value == null || isNaN(value)) return '<span class="na">N/A</span>';
      return `<span class="${value >= 0 ? 'positive' : 'negative'}">${Number(value).toFixed(2)}%</span>`;
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${coin.name.toUpperCase()}</td>
      <td>₱${Number(coin.current_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${formatPercentage(coin.price_change_percentage_24h)}</td>
    `;
    cryptoList.appendChild(tr);
  }

  const forexList = document.getElementById('forex-list');
  forexList.innerHTML = '';

  const phpRate = forex.rates.PHP;
  const currencies = ['USD', 'EUR', 'CNY', 'AUD', 'JPY', 'CHF', 'CAD'];
  const sortedForex = currencies
    .map(code => ({
      code,
      rate: forex.rates[code] ? (1 / forex.rates[code]) * phpRate : null
    }))
    .filter(item => item.rate)

  for (const { code, rate } of sortedForex) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${code}</td>
      <td>${Number(rate).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
    `;
    forexList.appendChild(tr);
  }
}

// Initial fetch
fetchPrices();
// Update every 5 minutes
setInterval(fetchPrices, 300000);