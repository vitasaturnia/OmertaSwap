import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/AddressValidationIndicator.scss';

const AddressValidationIndicator = ({ status }) => {
  if (!status) return null;

  const { isValid, isChecking, error } = status;

  if (isChecking) {
    return (
      <div className="address-validation checking">
        <FontAwesomeIcon icon={faSpinner} spin /> Validating...
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="address-validation valid">
        <FontAwesomeIcon icon={faCheckCircle} className="valid-icon" /> Valid address
      </div>
    );
  }

  if (error) {
    return (
      <div className="address-validation invalid">
        <FontAwesomeIcon icon={faTimesCircle} className="invalid-icon" /> Invalid address
      </div>
    );
  }

  return null;
};

export default AddressValidationIndicator; 