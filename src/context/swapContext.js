import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
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
  const [isExchangeLoading, setIsExchangeLoading] = useState(false);
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [exchangeId, setExchangeId] = useState(null);
  const [exchangeStatus, setExchangeStatus] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [iconMap, setIconMap] = useState({});
  const [isFixed, setIsFixed] = useState(false);
  const [estimatedExchangeAmount, setEstimatedExchangeAmount] = useState(null);
  const [depositAddress, setDepositAddress] = useState(null);
  const [exchangeDetails, setExchangeDetails] = useState(null);

  // Verify API key is present
  useEffect(() => {
    if (!API_KEY) {
      console.error('API key is missing. Please check your .env file.');
      setError('API key is missing. Please check your configuration.');
    }
  }, []);

  const fetchEstimated = useCallback(async (amount, from, to) => {
    if (amount && from && to) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid amount greater than 0');
        setEstimatedExchangeAmount(null);
        return;
      }

      setIsEstimateLoading(true);
      try {
        console.log('Fetching estimate with params:', {
          api_key: API_KEY ? 'API_KEY_PRESENT' : 'API_KEY_MISSING',
          fixed: isFixed,
          currency_from: from.toLowerCase(),
          currency_to: to.toLowerCase(),
          amount: numericAmount,
        });

        const response = await axios.get(`${API_URL}/get_estimated`, {
          params: {
            api_key: API_KEY,
            fixed: isFixed,
            currency_from: from.toLowerCase(),
            currency_to: to.toLowerCase(),
            amount: numericAmount,
          },
        });

        console.log('API Response:', response.data);

        if (!response.data) {
          throw new Error('Empty response from server');
        }

        let estimatedAmount;
        // Handle direct number or string number responses
        if (typeof response.data === 'number' || (typeof response.data === 'string' && !isNaN(parseFloat(response.data)))) {
          estimatedAmount = parseFloat(response.data);
          console.log('Using direct number response:', estimatedAmount);
        } 
        // Then check for object responses
        else if (typeof response.data === 'object') {
          if (typeof response.data.estimated_amount === 'number' || (typeof response.data.estimated_amount === 'string' && !isNaN(parseFloat(response.data.estimated_amount)))) {
            estimatedAmount = parseFloat(response.data.estimated_amount);
            console.log('Using estimated_amount from response:', estimatedAmount);
          } else if (response.data.error) {
            throw new Error(response.data.error);
          } else if (typeof response.data.result === 'number' || (typeof response.data.result === 'string' && !isNaN(parseFloat(response.data.result)))) {
            estimatedAmount = parseFloat(response.data.result);
            console.log('Using result from response:', estimatedAmount);
          } else if (typeof response.data.estimated === 'number' || (typeof response.data.estimated === 'string' && !isNaN(parseFloat(response.data.estimated)))) {
            estimatedAmount = parseFloat(response.data.estimated);
            console.log('Using estimated from response:', estimatedAmount);
          } else {
            console.error('Unexpected object response format:', response.data);
            throw new Error('Invalid response format from server');
          }
        } else {
          console.error('Unexpected response type:', typeof response.data, 'value:', response.data);
          throw new Error('Invalid response format from server');
        }

        if (estimatedAmount > 0) {
          console.log('Setting estimated amount:', estimatedAmount);
          setEstimatedExchangeAmount(estimatedAmount);
          setError(null);
        } else {
          throw new Error('Invalid estimated amount received');
        }
      } catch (error) {
        console.error('Error fetching estimated exchange:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        
        setEstimatedExchangeAmount(null);
        
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError(`Invalid request parameters: ${error.response.data?.error || 'Please check your input.'}`);
              break;
            case 401:
              setError('Authentication failed. Please check your API key.');
              break;
            case 429:
              setError('Too many requests. Please try again later.');
              break;
            default:
              setError(error.response.data?.error || 'Failed to estimate exchange. Please try again later.');
          }
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('Failed to estimate exchange. Please try again later.');
        }
      } finally {
        setIsEstimateLoading(false);
      }
    } else {
      setEstimatedExchangeAmount(null);
    }
  }, [isFixed, setError, setIsEstimateLoading, setEstimatedExchangeAmount]);

  const debouncedFetchEstimated = useMemo(
    () => debounce(fetchEstimated, 500),
    [fetchEstimated]
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
    if (!API_KEY) {
      setError('API key is missing. Please check your configuration.');
      return;
    }

    const isValid = validateForm(data);
    if (isValid) {
      setIsExchangeLoading(true);
      setError(null);
      try {
        // Step 1: Create the exchange
        const createResponse = await axios.post(`${API_URL}/create_exchange`, {
          api_key: API_KEY,
          fixed: isFixed,
          currency_from: data.sellCurrency.toLowerCase(),
          currency_to: data.buyCurrency.toLowerCase(),
          amount: data.sellAmount,
          address_to: data.recipientAddress,
        });

        if (!createResponse.data || !createResponse.data.id) {
          throw new Error('Failed to create exchange: Invalid response');
        }

        const exchangeId = createResponse.data.id;
        setExchangeId(exchangeId);
        setExchangeStatus(createResponse.data.status || 'created');
        setDepositAddress(createResponse.data.address_from);
        setExchangeDetails(createResponse.data);

        // Step 2: Start monitoring the exchange status
        const monitorExchange = async () => {
          try {
            const statusResponse = await axios.get(`${API_URL}/get_exchange`, {
              params: {
                api_key: API_KEY,
                id: exchangeId
              }
            });

            if (statusResponse.data) {
              setExchangeStatus(statusResponse.data.status);
              setExchangeDetails(statusResponse.data);

              // Continue monitoring if the exchange is not in a final state
              if (!['finished', 'failed', 'refunded', 'expired'].includes(statusResponse.data.status)) {
                setTimeout(monitorExchange, 10000); // Check every 10 seconds
              }
            }
          } catch (error) {
            console.error('Error monitoring exchange:', error);
            // Don't stop monitoring on temporary errors
            setTimeout(monitorExchange, 10000);
          }
        };

        // Start monitoring
        monitorExchange();

      } catch (error) {
        console.error('Error creating exchange:', error);
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError('Invalid request parameters. Please check your input.');
              break;
            case 401:
              setError('Authentication failed. Please check your API key in the .env file.');
              break;
            case 429:
              setError('Too many requests. Please try again later.');
              break;
            default:
              setError(error.response.data?.error || 'Failed to create exchange. Please try again later.');
          }
        } else {
          setError(error.message || 'Failed to create exchange. Please try again later.');
        }
      } finally {
        setIsExchangeLoading(false);
      }
    }
  }, [isFixed, validateForm, API_KEY]);

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
    isExchangeLoading,
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
    depositAddress,
    exchangeDetails,
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