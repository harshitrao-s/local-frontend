import React from 'react';

const ACNInput = ({ value, onChange, name = "company_acn", className = "form-control" }) => {
  
  const handleInput = (e) => {
    // 1. Remove all non-digits
    let raw = e.target.value.replace(/\D/g, '');
    
    // 2. Limit to 9 digits (Standard ACN length)
    raw = raw.substring(0, 9);
    
    // 3. Format into 123 456 789
    const parts = [];
    if (raw.length > 0) parts.push(raw.substring(0, 3));
    if (raw.length > 3) parts.push(raw.substring(3, 6));
    if (raw.length > 6) parts.push(raw.substring(6, 9));
    
    const formatted = parts.join(' ');

    // 4. Send back to parent
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
      className={className}
      placeholder="9 digit number"
      value={value}
      onChange={handleInput}
      maxLength={11} // 9 digits + 2 spaces
      inputMode="numeric"
      autoComplete="off"
    />
  );
};

export default ACNInput;