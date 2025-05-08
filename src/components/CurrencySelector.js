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
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      paddingTop: 0,
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#eee' : '#fff',
      color: '#333',
      padding: 10,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
    }),
    input: (provided) => ({
      ...provided,
      color: '#333',
    }),
    group: (provided) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: '#999',
      fontWeight: 'bold',
      padding: '8px 12px',
      fontSize: '0.9em',
      borderTop: '1px solid #eee',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#999',
    }),
  };

  const formatOptionLabel = ({ value, label, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {icon ? (
        <img src={icon} alt={value} style={{ marginRight: '10px', width: '20px', height: '20px' }} />
      ) : (
        <div style={{ marginRight: '10px', width: '20px', height: '20px', backgroundColor: '#ddd', borderRadius: '50%' }} />
      )}
      <span>{label}</span>
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
              icon: iconMap[value.toUpperCase()],
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
    />
  );
});

export default CurrencySelector;
