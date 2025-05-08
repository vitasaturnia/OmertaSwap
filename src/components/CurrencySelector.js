import React, { forwardRef } from 'react';
import Select from 'react-select';
import { useSwap } from '../context/swapContext';
import '../assets/all.sass';

const CurrencySelector = forwardRef(({ value, onChange, currencies }, ref) => {
  const { iconMap, getFilteredOptions, setSearchInput } = useSwap();

  const options = getFilteredOptions();

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      borderColor: '#ddd',
      color: '#333',
      paddingLeft: 8,
      cursor: 'pointer',
      minHeight: '42px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      paddingTop: 0,
      zIndex: 20,
      maxHeight: '300px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f5f5f5' : '#fff',
      color: '#333',
      padding: '10px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: '#f5f5f5',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      display: 'flex',
      alignItems: 'center',
    }),
    input: (provided) => ({
      ...provided,
      color: '#333',
      margin: 0,
      padding: 0,
    }),
    group: (provided) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: '#666',
      fontWeight: '600',
      padding: '8px 12px',
      fontSize: '0.85em',
      backgroundColor: '#f8f8f8',
      borderBottom: '1px solid #eee',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#999',
      padding: '0 8px',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#999',
      padding: '0 8px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 8px',
    }),
  };

  const formatOptionLabel = ({ value, label, icon, isPopular }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ 
        width: '24px', 
        height: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: icon ? 'transparent' : '#eee',
      }}>
        {icon ? (
          <img 
            src={icon} 
            alt={value} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain' 
            }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = iconMap['GENERIC'];
            }}
          />
        ) : (
          <span style={{ 
            fontSize: '12px', 
            color: '#999',
            textTransform: 'uppercase'
          }}>
            {value.slice(0, 2)}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: isPopular ? '600' : '400',
          color: '#333'
        }}>
          {label}
        </span>
        {isPopular && (
          <span style={{ 
            fontSize: '12px', 
            color: '#666',
            marginTop: '2px'
          }}>
            Popular
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Select
      ref={ref}
      options={options}
      styles={customStyles}
      value={
        value
          ? {
              value,
              label: `${currencies.find((c) => c.symbol === value)?.name} (${value})`,
              icon: iconMap[value.toUpperCase()] || iconMap['GENERIC'],
              isPopular: ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'SOL', 'MATIC'].includes(value.toUpperCase()),
            }
          : null
      }
      onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : null)}
      formatOptionLabel={formatOptionLabel}
      placeholder="Select a cryptocurrency"
      className="currency-selector"
      onInputChange={(input) => setSearchInput(input)}
      components={{ IndicatorSeparator: null }}
      isSearchable={true}
      isClearable={true}
      blurInputOnSelect={true}
    />
  );
});

export default CurrencySelector;
