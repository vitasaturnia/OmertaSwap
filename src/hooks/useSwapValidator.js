import { useCallback } from 'react';
import WAValidator from 'wallet-address-validator';

export const useSwapFormValidation = (minAmount, maxAmount) => {
  const validateForm = useCallback((data) => {
    const errors = {};

    if (!data.sellAmount) {
      errors.sellAmount = 'Amount is required';
    } else {
      const amount = parseFloat(data.sellAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.sellAmount = 'Invalid amount';
      } else if (minAmount && amount < minAmount) {
        errors.sellAmount = `Minimum amount is ${minAmount}`;
      } else if (maxAmount && amount > maxAmount) {
        errors.sellAmount = `Maximum amount is ${maxAmount}`;
      }
    }

    if (!data.sellCurrency) {
      errors.sellCurrency = 'Sell currency is required';
    }

    if (!data.buyCurrency) {
      errors.buyCurrency = 'Buy currency is required';
    }

    if (!data.recipientAddress) {
      errors.recipientAddress = 'Recipient address is required';
    } else if (data.buyCurrency) {
      const isValidAddress = WAValidator.validate(data.recipientAddress, data.buyCurrency);
      if (!isValidAddress) {
        errors.recipientAddress = `Invalid ${data.buyCurrency} address`;
      }
    }

    return errors;
  }, [minAmount, maxAmount]);

  return { validateForm };
};