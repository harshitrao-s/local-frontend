import React from 'react';

const ABNInput = ({ value, onChange, name = "company_abn", className = "form-control" }) => {
  
  const handleInput = (e) => {
    // 1. Remove all non-digits
    let raw = e.target.value.replace(/\D/g, '');
    
    // 2. Limit to 11 digits
    raw = raw.substring(0, 11);
    
    // 3. Format into 12 345 678 901
    const parts = [];
    if (raw.length > 0) parts.push(raw.substring(0, 2));
    if (raw.length > 2) parts.push(raw.substring(2, 5));
    if (raw.length > 5) parts.push(raw.substring(5, 8));
    if (raw.length > 8) parts.push(raw.substring(8, 11));
    
    const formatted = parts.join(' ');

    // 4. Send the formatted value back to the parent handler
    onChange({
      target: {
        name: name,
        value: formatted
      }
    });
  };

  return (
    <input
      type="text"
      name={name}
      className={className} // Works with "form-control" or your own CSS
      placeholder="11 digit number"
      value={value}
      onChange={handleInput}
      maxLength={14}
      inputMode="numeric"
      autoComplete="off"
    />
  );
};

export default ABNInput;