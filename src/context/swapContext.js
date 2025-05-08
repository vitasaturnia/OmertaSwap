import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_KEY = process.env.REACT_APP_SWAP_API_KEY;
const API_URL = 'https://api.simpleswap.io/v1';

const SwapContext = createContext();

export const SwapProvider = ({ children }) => {
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellCurrency, setSellCurrency] = useState('');
  const [buyCurrency, setBuyCurrency] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [availablePairs, setAvailablePairs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimateLoading, setIsEstimateLoading] = useState(false);
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [exchangeId, setExchangeId] = useState(null);
  const [exchangeStatus, setExchangeStatus] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [iconMap, setIconMap] = useState({});
  const [isFixed, setIsFixed] = useState(false);
  const [estimatedExchangeAmount, setEstimatedExchangeAmount] = useState(null);

  const debouncedFetchEstimated = useCallback(
    debounce(async (amount, from, to) => {
      if (amount && from && to) {
        setIsEstimateLoading(true);
        try {
          const response = await axios.get(`${API_URL}/get_estimated`, {
            params: {
              api_key: API_KEY,
              fixed: isFixed,
              currency_from: from,
              currency_to: to,
              amount: amount,
            },
          });

          let estimatedAmount;
          if (typeof response.data === 'number') {
            estimatedAmount = response.data;
          } else if (response.data && typeof response.data.estimated_amount === 'number') {
            estimatedAmount = response.data.estimated_amount;
          } else {
            throw new Error('Invalid response format');
          }

          setEstimatedExchangeAmount(estimatedAmount);
        } catch (error) {
          console.error('Error fetching estimated exchange:', error);
          setError('Failed to estimate exchange. Please try again later.');
          setEstimatedExchangeAmount(null);
        } finally {
          setIsEstimateLoading(false);
        }
      } else {
        setEstimatedExchangeAmount(null);
      }
    }, 500),
    [isFixed, API_KEY, API_URL, setError, setIsEstimateLoading, setEstimatedExchangeAmount]
  );

  const fetchEstimatedExchange = useCallback((amount, from, to) => {
    debouncedFetchEstimated(amount, from, to);
  }, [debouncedFetchEstimated]);

  useEffect(() => {
    const fetchCryptocurrencies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/get_all_currencies`, {
          params: { api_key: API_KEY },
        });

        if (response.data && Array.isArray(response.data)) {
          const cryptos = response.data.filter(currency => !currency.isFiat);
          setCryptocurrencies(cryptos);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
        setError('Failed to load cryptocurrencies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const loadIcons = async () => {
      const icons = {};
      const iconContext = require.context('cryptocurrency-icons/svg/color', false, /\.svg$/);
      iconContext.keys().forEach(key => {
        const currencyCode = key.split('/').pop().split('.')[0].toUpperCase();
        icons[currencyCode] = iconContext(key);
      });
      setIconMap(icons);
    };

    fetchCryptocurrencies();
    loadIcons();
  }, []);

  const fetchAvailablePairs = useCallback(async (currency, fixed) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/get_pairs`, {
        params: { api_key: API_KEY, fixed: fixed, symbol: currency },
      });

      if (response.data && Array.isArray(response.data)) {
        setAvailablePairs(response.data);
        setBuyCurrency('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching available pairs:', error);
      setAvailablePairs([]);
      setBuyCurrency('');
      setError('No available pairs for the selected currency.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setAvailablePairs, setBuyCurrency]);

  const fetchMinMaxAmount = useCallback(async () => {
    if (sellCurrency && buyCurrency) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/get_ranges`, {
          params: {
            api_key: API_KEY,
            fixed: isFixed,
            currency_from: sellCurrency,
            currency_to: buyCurrency,
          },
        });

        if (response.data && response.data.min) {
          setMinAmount(response.data.min);
          setMaxAmount(response.data.max || null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching min/max amount:', error);
        setMinAmount(null);
        setMaxAmount(null);
        setError('Unable to fetch min/max amounts for this pair.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [sellCurrency, buyCurrency, isFixed]);

  const handleSwapCurrencies = useCallback(() => {
    setSellCurrency(buyCurrency);
    setBuyCurrency(sellCurrency);
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
  }, [buyCurrency, sellCurrency, buyAmount, sellAmount]);

  const validateForm = useCallback((data) => {
    const errors = {};

    if (!data.sellAmount) {
      errors.sellAmount = 'Please enter an amount to sell';
    } else if (minAmount && parseFloat(data.sellAmount) < parseFloat(minAmount)) {
      errors.sellAmount = `Minimum amount is ${minAmount} ${data.sellCurrency}`;
    } else if (maxAmount && parseFloat(data.sellAmount) > parseFloat(maxAmount)) {
      errors.sellAmount = `Maximum amount is ${maxAmount} ${data.sellCurrency}`;
    }

    if (!data.sellCurrency) {
      errors.sellCurrency = 'Please select a cryptocurrency to sell';
    }

    if (!data.buyCurrency) {
      errors.buyCurrency = 'Please select a cryptocurrency to buy';
    }

    if (!data.recipientAddress) {
      errors.recipientAddress = 'Please enter a recipient address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [minAmount, maxAmount]);

  const handleSubmit = useCallback(async (data) => {
    const isValid = validateForm(data);
    if (isValid) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_URL}/create_exchange`, {
          api_key: API_KEY,
          fixed: isFixed,
          currency_from: data.sellCurrency,
          currency_to: data.buyCurrency,
          amount: data.sellAmount,
          address_to: data.recipientAddress,
        });

        if (response.data && response.data.id) {
          setExchangeId(response.data.id);
          setExchangeStatus(response.data.status);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error creating exchange:', error);
        setError('Failed to create exchange. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isFixed, validateForm]);

  const getFilteredOptions = useCallback(() => {
    const popular = cryptocurrencies.filter(c => ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT'].includes(c.symbol.toUpperCase()));
    const others = cryptocurrencies.filter(c => !['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT'].includes(c.symbol.toUpperCase()));

    const createOption = c => ({
      value: c.symbol,
      label: `${c.name} (${c.symbol})`,
      icon: iconMap[c.symbol.toUpperCase()],
      isPopular: ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT'].includes(c.symbol.toUpperCase()),
    });

    const options = [
      { label: 'Popular', options: popular.map(createOption) },
      { label: 'Other', options: others.map(createOption) },
    ];

    if (!searchInput) return options;

    const filterOptions = opts => opts.filter(option => 
      option.label.toLowerCase().includes(searchInput.toLowerCase()) || 
      option.value.toLowerCase().includes(searchInput.toLowerCase())
    );

    return options.map(group => ({ ...group, options: filterOptions(group.options) })).filter(group => group.options.length > 0);
  }, [cryptocurrencies, iconMap, searchInput]);

  const contextValue = {
    sellAmount,
    setSellAmount,
    buyAmount,
    setBuyAmount,
    sellCurrency,
    setSellCurrency,
    buyCurrency,
    setBuyCurrency,
    recipientAddress,
    setRecipientAddress,
    cryptocurrencies,
    availablePairs,
    error,
    setError,
    isLoading,
    isEstimateLoading,
    minAmount,
    maxAmount,
    formErrors,
    setFormErrors,
    exchangeId,
    exchangeStatus,
    isFixed,
    setIsFixed,
    estimatedExchangeAmount,
    handleSwapCurrencies,
    handleSubmit,
    searchInput,
    setSearchInput,
    iconMap,
    getFilteredOptions,
    fetchAvailablePairs,
    fetchEstimatedExchange,
    fetchMinMaxAmount,
  };

  return <SwapContext.Provider value={contextValue}>{children}</SwapContext.Provider>;
};

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error('useSwap must be used within a SwapProvider');
  }
  return context;
};

export default SwapContext;