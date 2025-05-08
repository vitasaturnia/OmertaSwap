import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptocurrencyCategories = async () => {
  try {
    const [popular, stableCoins, newCoins, gainers24h, losers24h] = await Promise.all([
      axios.get(`${API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
        },
      }),
      axios.get(`${API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          category: 'stablecoins',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
        },
      }),
      axios.get(`${API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'newest',
          per_page: 10,
          page: 1,
        },
      }),
      axios.get(`${API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'percent_change_24h_desc',
          per_page: 10,
          page: 1,
        },
      }),
      axios.get(`${API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'percent_change_24h_asc',
          per_page: 10,
          page: 1,
        },
      }),
    ]);

    return {
      popular: popular.data.map(coin => coin.symbol.toUpperCase()),
      topStable: stableCoins.data.map(coin => coin.symbol.toUpperCase()),
      new: newCoins.data.map(coin => coin.symbol.toUpperCase()),
      gainers24h: gainers24h.data.map(coin => coin.symbol.toUpperCase()),
      losers24h: losers24h.data.map(coin => coin.symbol.toUpperCase()),
    };
  } catch (error) {
    console.error("Failed to fetch cryptocurrency categories:", error);
    return {};
  }
};
