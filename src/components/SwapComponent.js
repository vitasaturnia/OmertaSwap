import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDown, faSync, faInfoCircle, faExclamationTriangle, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from 'react-spinners';
import CurrencySelector from './CurrencySelector';
import { useSwap } from '../context/swapContext';
import Layout from './Layout';

const SwapComponent = () => {
  const {
    cryptocurrencies,
    availablePairs,
    error,
    isLoading,
    exchangeId,
    exchangeStatus,
    minAmount,
    maxAmount,
    handleSwapCurrencies,
    handleSubmit: contextHandleSubmit,
    isFixed,
    setIsFixed,
    fetchAvailablePairs,
    estimatedExchangeAmount,
    isEstimateLoading,
    sellAmount,
    buyAmount,
    setSellAmount,
    setBuyAmount,
    sellCurrency,
    buyCurrency,
    setSellCurrency,
    setBuyCurrency,
    fetchEstimatedExchange,
    fetchMinMaxAmount,
  } = useSwap();

  const [isBuyInputActive, setIsBuyInputActive] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      sellAmount: '',
      buyAmount: '',
      sellCurrency: '',
      buyCurrency: '',
      recipientAddress: '',
    },
  });

  useEffect(() => {
    if (sellCurrency) {
      fetchAvailablePairs(sellCurrency, isFixed);
    }
  }, [sellCurrency, isFixed, fetchAvailablePairs]);

  useEffect(() => {
    if (sellCurrency && buyCurrency) {
      fetchMinMaxAmount();
    }
  }, [sellCurrency, buyCurrency, fetchMinMaxAmount]);

  const handleEstimateExchange = useCallback(() => {
    const fromAmount = isBuyInputActive ? buyAmount : sellAmount;
    const fromCurrency = isBuyInputActive ? buyCurrency : sellCurrency;
    const toCurrency = isBuyInputActive ? sellCurrency : buyCurrency;

    if (fromAmount && fromCurrency && toCurrency) {
      fetchEstimatedExchange(fromAmount, fromCurrency, toCurrency);
    }
  }, [sellAmount, buyAmount, sellCurrency, buyCurrency, fetchEstimatedExchange, isBuyInputActive]);

  useEffect(() => {
    handleEstimateExchange();
  }, [handleEstimateExchange]);

  useEffect(() => {
    if (estimatedExchangeAmount !== null) {
      if (isBuyInputActive) {
        setSellAmount(estimatedExchangeAmount.toString());
      } else {
        setBuyAmount(estimatedExchangeAmount.toString());
      }
    }
  }, [estimatedExchangeAmount, isBuyInputActive, setSellAmount, setBuyAmount]);

  const onSubmit = data => contextHandleSubmit({...data, sellAmount, buyAmount});

  const handleReset = () => {
    reset();
    setSellAmount('');
    setBuyAmount('');
    setSellCurrency('');
    setBuyCurrency('');
    setIsFixed(false);
    setIsBuyInputActive(false);
  };

  const handleSellAmountChange = (e) => {
    setSellAmount(e.target.value);
    setIsBuyInputActive(false);
  };

  const handleBuyAmountChange = (e) => {
    setBuyAmount(e.target.value);
    setIsBuyInputActive(true);
  };

  return (
    <Layout>
      <div className="swap-container">
        <div className="swap-box">
          <h1 className="title">Swap Cryptocurrencies</h1>
          {error && (
            <div className="notification is-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
              <button className="button is-small is-info ml-2" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                <FontAwesomeIcon icon={faSync} spin={isLoading} /> Retry
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label className="label">Sell</label>
              <div className="control">
                <input
                  className={`input ${errors.sellAmount ? 'is-danger' : ''}`}
                  type="number"
                  placeholder="0"
                  value={sellAmount}
                  onChange={handleSellAmountChange}
                />
              </div>
              {errors.sellAmount && <p className="help is-danger">{errors.sellAmount.message}</p>}
            </div>

            <div className="field">
              <label className="label">Sell Currency</label>
              <div className="control">
                <Controller
                  name="sellCurrency"
                  control={control}
                  rules={{ required: 'Sell currency is required' }}
                  render={({ field }) => (
                    <CurrencySelector
                      {...field}
                      value={sellCurrency}
                      onChange={(value) => {
                        setSellCurrency(value);
                        field.onChange(value);
                      }}
                      currencies={cryptocurrencies}
                    />
                  )}
                />
              </div>
              {errors.sellCurrency && <p className="help is-danger">{errors.sellCurrency.message}</p>}
            </div>

            <div className="swap-controls">
              <div className={`rate-type-selector ${isFixed ? 'fixed' : 'floating'}`} onClick={() => setIsFixed(!isFixed)}>
                <FontAwesomeIcon icon={isFixed ? faLock : faLockOpen} />
                <span>{isFixed ? 'Fixed Rate' : 'Floating Rate'}</span>
              </div>
              <div className="swap-icon-container">
                <FontAwesomeIcon
                  icon={faArrowsUpDown}
                  className="swap-icon"
                  onClick={handleSwapCurrencies}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Buy</label>
              <div className="control">
                <input
                  className={`input ${errors.buyAmount ? 'is-danger' : ''}`}
                  type="number"
                  placeholder="0"
                  value={buyAmount}
                  onChange={handleBuyAmountChange}
                />
              </div>
              {errors.buyAmount && <p className="help is-danger">{errors.buyAmount.message}</p>}
            </div>

            <div className="field">
              <label className="label">Buy Currency</label>
              <div className="control">
                <Controller
                  name="buyCurrency"
                  control={control}
                  rules={{ required: 'Buy currency is required' }}
                  render={({ field }) => (
                    <CurrencySelector
                      {...field}
                      value={buyCurrency}
                      onChange={(value) => {
                        setBuyCurrency(value);
                        field.onChange(value);
                      }}
                      currencies={availablePairs.map(symbol => cryptocurrencies.find(c => c.symbol === symbol)).filter(Boolean)}
                    />
                  )}
                />
              </div>
              {errors.buyCurrency && <p className="help is-danger">{errors.buyCurrency.message}</p>}
            </div>

            {isEstimateLoading && (
              <p className="help">
                <ClipLoader size={15} /> Updating estimate...
              </p>
            )}

            <div className="field">
              <label className="label">Recipient Address</label>
              <div className="control">
                <Controller
                  name="recipientAddress"
                  control={control}
                  rules={{ required: 'Recipient address is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`input ${errors.recipientAddress ? 'is-danger' : ''}`}
                      type="text"
                      placeholder="Enter recipient address"
                    />
                  )}
                />
              </div>
              {errors.recipientAddress && <p className="help is-danger">{errors.recipientAddress.message}</p>}
            </div>

            {minAmount && (
              <p className="help">
                <span className="has-text-white has-text-centered mb-2">
                  <FontAwesomeIcon icon={faInfoCircle} /> Min: {minAmount} {sellCurrency}
                </span>
                {maxAmount && ` | Max: ${maxAmount} ${sellCurrency}`}
              </p>
            )}

            <div className="field is-grouped">
              <div className="control">
                <button className="button is-primary mt-3" type="submit" disabled={isLoading}>
                  {isLoading ? <ClipLoader color="#ffffff" size={20} /> : 'Swap'}
                </button>
              </div>
              <div className="control">
                <button className="button is-light mt-3" type="button" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </form>

          {exchangeId && (
            <div className="mt-4">
              <p className="has-text-success">Exchange created successfully!</p>
              <p>Exchange ID: {exchangeId}</p>
              <p>Status: {exchangeStatus}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SwapComponent;