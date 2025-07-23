import { useState } from 'react';
import type { AllowedCity } from '../types/homeBase';

/**
 * Hook for managing home base selection form state and validation.
 * Does not perform any data fetching or geocoding.
 */
export function useHomeBaseSelection() {
  const [selectedCity, setSelectedCity] = useState<AllowedCity | undefined>(undefined);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  /**
   * Returns true if all required fields are valid.
   */
  const isValid = Boolean(selectedCity && street.trim() && number.trim());

  /**
   * Handler for selecting a city.
   */
  function handleCitySelect(city: AllowedCity) {
    setSelectedCity(city);
    setError(undefined);
  }

  /**
   * Handler for street input change.
   */
  function handleStreetChange(value: string) {
    setStreet(value);
    setError(undefined);
  }

  /**
   * Handler for number input change.
   */
  function handleNumberChange(value: string) {
    setNumber(value);
    setError(undefined);
  }

  /**
   * Handler for form submit. Calls the provided callback if valid.
   */
  function handleSubmit(onSubmit: (data: { city: AllowedCity; street: string; number: string }) => void) {
    setTouched(true);
    if (isValid && selectedCity) {
      setLoading(true);
      setError(undefined);
      try {
        onSubmit({ city: selectedCity, street: street.trim(), number: number.trim() });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please select a city and enter your full address.');
    }
  }

  return {
    selectedCity,
    street,
    number,
    loading,
    error,
    touched,
    isValid,
    setSelectedCity: handleCitySelect,
    setStreet: handleStreetChange,
    setNumber: handleNumberChange,
    handleSubmit,
  };
} 