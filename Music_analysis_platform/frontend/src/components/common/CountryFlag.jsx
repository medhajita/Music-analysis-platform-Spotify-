import React from 'react';

/**
 * Displays an emoji flag based on ISO 3166-1 alpha-2 country code
 * @param {string} code - Two-letter country code
 */
const CountryFlag = ({ code, className = "w-5 h-5" }) => {
  if (!code) return null;

  const getEmoji = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  try {
    return (
      <span 
        className={`inline-flex items-center justify-center font-serif text-lg leading-none ${className}`}
        title={code}
      >
        {getEmoji(code)}
      </span>
    );
  } catch (e) {
    return <span className="text-xs text-slate-500">[{code}]</span>;
  }
};

export default CountryFlag;
