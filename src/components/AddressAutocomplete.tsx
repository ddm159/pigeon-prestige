import React, { useState, useEffect } from 'react';
import { searchAddresses } from '../services/geocodingService';
import type { GeocodedAddress } from '../services/geocodingService';

export interface AddressAutocompleteProps {
  city: string;
  onSelect: (feature: GeocodedAddress) => void;
  label?: string;
}

/**
 * AddressAutocomplete component for LocationIQ-powered address search.
 * @param city - City to restrict search (Mendonk, Sint-Kruis-Winkel, Wachtebeke)
 * @param onSelect - Callback when an address is selected
 * @param label - Optional label for the input
 */
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ city, onSelect, label }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<GeocodedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!input || !city) {
      setResults([]);
      setError(null);
      return;
    }
    const handler = setTimeout(() => {
      setLoading(true);
      searchAddresses(input, city)
        .then(res => {
          setResults(res);
          setError(null);
        })
        .catch(e => setError('LocationIQ error: ' + e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [input, city]);

  const handleSelect = (feature: GeocodedAddress) => {
    setInput(feature.properties.name);
    setShowDropdown(false);
    onSelect(feature);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label htmlFor="address-autocomplete-input" style={{ display: 'block', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        id="address-autocomplete-input"
        type="text"
        value={input}
        onChange={e => {
          setInput(e.target.value);
          setShowDropdown(true);
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls="address-autocomplete-list"
        aria-expanded={showDropdown && results.length > 0}
        aria-activedescendant={undefined}
        placeholder="Type your address..."
        style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onFocus={() => input && setShowDropdown(true)}
      />
      {loading && <div style={{ fontSize: '0.9rem', color: '#888' }}>Loading...</div>}
      {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
      {showDropdown && results.length > 0 && (
        <ul
          id="address-autocomplete-list"
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            width: '100%',
            maxHeight: 200,
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {results.map((feature, idx) => {
            const { name, postcode, city, suburb, locality } = feature.properties;
            // Prefer locality or suburb for display if present
            const displayLocality = locality || suburb;
            return (
              <li
                key={name + idx}
                role="option"
                tabIndex={-1}
                aria-selected={false}
                style={{ padding: '8px', cursor: 'pointer' }}
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelect(feature);
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {name}
                  {postcode && `, ${postcode}`}
                </span>
                {displayLocality && (
                  <span style={{ color: '#2563eb', fontWeight: 600 }}> — {displayLocality}</span>
                )}
                {city && (!displayLocality || city.toLowerCase() !== displayLocality.toLowerCase()) && (
                  <span style={{ color: '#888', marginLeft: 4 }}>
                    ({city})
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}; 