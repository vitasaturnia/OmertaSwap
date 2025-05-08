import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { getCoderByCoinName } from '@ensdomains/address-encoder';

const API_KEY = process.env.REACT_APP_SWAP_API_KEY;
const API_URL = 'https://api.simpleswap.io/v1';

// Add axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add request interceptor for API key
api.interceptors.request.use(config => {
  config.params = {
    ...config.params,
    api_key: API_KEY
  };
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          console.error('Authentication failed');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API request failed:', error.response.status);
          break;
      }
    }
    return Promise.reject(error);
  }
);

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
  const [addressValidationStatus, setAddressValidationStatus] = useState({
    isValid: false,
    isChecking: false,
    hint: '',
    error: ''
  });

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

        const response = await api.get('/get_estimated', {
          params: {
            fixed: isFixed,
            currency_from: from.toLowerCase(),
            currency_to: to.toLowerCase(),
            amount: numericAmount,
          }
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
        // First, fetch top 100 coins from CoinGecko
        const geckoResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: false
          }
        });

        // Get the symbols of top 100 coins
        const topCoins = new Set(geckoResponse.data.map(coin => coin.symbol.toUpperCase()));

        // Then fetch all currencies from SimpleSwap
        const response = await api.get('/get_all_currencies');

        if (response.data && Array.isArray(response.data)) {
          // Filter out fiat currencies and only keep top 100 coins
          const cryptos = response.data
            .filter(currency => !currency.isFiat && topCoins.has(currency.symbol.toUpperCase()))
            .sort((a, b) => {
              // Define popular cryptocurrencies to show first
              const popularCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'SOL', 'MATIC'];
              const aIsPopular = popularCoins.includes(a.symbol.toUpperCase());
              const bIsPopular = popularCoins.includes(b.symbol.toUpperCase());
              
              if (aIsPopular && !bIsPopular) return -1;
              if (!aIsPopular && bIsPopular) return 1;
              return 0;
            });
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
      let genericIcon;
      try {
        // Load the generic icon as fallback
        genericIcon = await import('cryptocurrency-icons/svg/color/generic.svg');
        icons['GENERIC'] = genericIcon.default;

        // Load icons for popular cryptocurrencies
        const popularCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'SOL', 'MATIC'];
        for (const symbol of popularCoins) {
          try {
            const icon = await import(`cryptocurrency-icons/svg/color/${symbol.toLowerCase()}.svg`);
            icons[symbol] = icon.default;
          } catch (error) {
            console.warn(`Icon not found for ${symbol}, using generic icon`);
            icons[symbol] = genericIcon.default;
          }
        }

        // Load icons for other cryptocurrencies as needed
        const iconContext = require.context('cryptocurrency-icons/svg/color', false, /\.svg$/);
        iconContext.keys().forEach(key => {
          const currencyCode = key.split('/').pop().split('.')[0].toUpperCase();
          if (!icons[currencyCode]) {
            icons[currencyCode] = iconContext(key);
          }
        });

        setIconMap(icons);
      } catch (error) {
        console.error('Error loading icons:', error);
        // Set a basic fallback icon map with a default icon
        const defaultIcon = require('cryptocurrency-icons/svg/color/generic.svg');
        setIconMap({ 'GENERIC': defaultIcon });
      }
    };

    fetchCryptocurrencies();
    loadIcons();
  }, []);

  const fetchAvailablePairs = useCallback(async (currency, fixed) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/get_pairs', {
        params: { fixed: fixed, symbol: currency },
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
        const response = await api.get('/get_ranges', {
          params: {
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

  // Address validation utilities
  const getAddressFormatHint = useCallback((currency) => {
    try {
      const coder = getCoderByCoinName(currency?.toLowerCase());
      if (!coder) return 'Enter a valid cryptocurrency address';
    } catch (error) {
      return 'Enter a valid cryptocurrency address';
    }
    
    switch (currency?.toLowerCase()) {
      case 'btc':
        return 'Bitcoin addresses start with 1, 3, or bc1';
      case 'eth':
        return 'Ethereum addresses are 42 characters long and start with 0x';
      case 'doge':
        return 'Dogecoin addresses start with D and are 34-35 characters long';
      case 'xrp':
        return 'XRP addresses are 25-35 characters long';
      case 'ltc':
        return 'Litecoin addresses start with L, M, or 3';
      case 'bch':
        return 'Bitcoin Cash addresses start with bitcoincash: or 1';
      case 'xmr':
        return 'Monero addresses are 95 characters long';
      case 'dash':
        return 'Dash addresses start with X';
      case 'xlm':
        return 'Stellar addresses are 56 characters long';
      case 'ada':
        return 'Cardano addresses start with addr1';
      case 'sol':
        return 'Solana addresses are 32-44 characters long';
      case 'dot':
        return 'Polkadot addresses start with 1';
      case 'matic':
        return 'Polygon addresses are 42 characters long and start with 0x';
      default:
        return 'Enter a valid cryptocurrency address';
    }
  }, []);

  const validateAddress = useCallback((address, currency) => {
    if (!address || !currency) return false;
    
    try {
      const coder = getCoderByCoinName(currency.toLowerCase());
      if (!coder) return false;
      
      // Try to decode the address
      coder.decode(address);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // Real-time address validation
  const validateAddressInRealTime = useCallback(
    debounce((address, currency) => {
      if (!address || !currency) {
        setAddressValidationStatus({
          isValid: false,
          isChecking: false,
          hint: getAddressFormatHint(currency),
          error: ''
        });
        return;
      }

      setAddressValidationStatus(prev => ({ ...prev, isChecking: true }));

      try {
        const isValid = validateAddress(address, currency);
        
        setAddressValidationStatus({
          isValid,
          isChecking: false,
          hint: getAddressFormatHint(currency),
          error: isValid ? '' : `Invalid ${currency.toUpperCase()} address format`
        });
      } catch (error) {
        setAddressValidationStatus({
          isValid: false,
          isChecking: false,
          hint: getAddressFormatHint(currency),
          error: 'Error validating address'
        });
      }
    }, 500),
    [validateAddress, getAddressFormatHint]
  );

  // Update validation when address or currency changes
  useEffect(() => {
    if (recipientAddress && buyCurrency) {
      validateAddressInRealTime(recipientAddress, buyCurrency);
    }
  }, [recipientAddress, buyCurrency, validateAddressInRealTime]);

  // Enhanced validateForm function
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
    } else {
      const address = data.recipientAddress.trim();
      const currency = data.buyCurrency.toLowerCase();
      
      // Enhanced address validation
      if (!validateAddress(address, currency)) {
        errors.recipientAddress = `Invalid ${currency.toUpperCase()} address. Please check the address format.`;
      }

      // Additional checks for specific cryptocurrencies
      if (currency === 'xrp' || currency === 'xlm' || currency === 'xmr') {
        if (!data.extra_id_to) {
          errors.extra_id_to = `Please enter a memo/tag for ${currency.toUpperCase()}`;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [minAmount, maxAmount, validateAddress]);

  const handleSubmit = useCallback(async (data) => {
    if (!API_KEY) {
      setError('API key is missing. Please check your configuration.');
      return;
    }

    const isValid = validateForm(data);
    if (isValid) {
      setIsExchangeLoading(true);
      setError(null);
      
      // Prepare request data
      const requestData = {
        fixed: isFixed ? 1 : 0,
        currency_from: data.sellCurrency.toLowerCase(),
        currency_to: data.buyCurrency.toLowerCase(),
        amount: parseFloat(data.sellAmount).toString(),
        address_to: data.recipientAddress.trim(),
        return_address: data.recipientAddress.trim(),
        extra_id_to: '',
        extra_id_return: ''
      };

      // Add memo/tag for specific currencies if needed
      if (['xrp', 'xlm', 'xmr'].includes(data.buyCurrency.toLowerCase())) {
        requestData.extra_id_to = '0'; // Default memo/tag
      }

      console.log('Creating exchange with data:', requestData);

      try {
        // Step 1: Create the exchange
        const createResponse = await api.post('/create_exchange', requestData);

        console.log('Create exchange response:', createResponse.data);

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
            const statusResponse = await api.get('/get_exchange', {
              params: {
                id: exchangeId,
              },
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
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
          console.error('Request data:', {
            url: '/create_exchange',
            data: requestData,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          switch (error.response.status) {
            case 400:
              const errorMessage = error.response.data?.error || 
                                 error.response.data?.message || 
                                 error.response.data?.detail ||
                                 'Please check your input.';
              setError(`Invalid request parameters: ${errorMessage}`);
              break;
            case 401:
              setError(`Authentication failed: ${error.response.data?.error || 'Please check your API key in the .env file.'}`);
              break;
            case 404:
              setError('Exchange endpoint not found. Please check the API documentation.');
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
  }, [isFixed, validateForm]);

  // Memoize filtered options function
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

  // Add addressValidationStatus to context value
  const contextValue = useMemo(() => ({
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
    addressValidationStatus,
    validateAddressInRealTime,
    getAddressFormatHint,
  }), [
    sellAmount, buyAmount, sellCurrency, buyCurrency, recipientAddress,
    cryptocurrencies, availablePairs, error, isLoading, isEstimateLoading,
    isExchangeLoading, minAmount, maxAmount, formErrors, exchangeId,
    exchangeStatus, isFixed, estimatedExchangeAmount, searchInput, iconMap,
    getFilteredOptions, depositAddress, exchangeDetails, addressValidationStatus,
    validateAddressInRealTime, getAddressFormatHint
  ]);

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