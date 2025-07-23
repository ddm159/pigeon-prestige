import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { homeBaseService } from '../services/homeBaseService';
import type { AllowedCity } from '../types/homeBase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { getAddressDetails } from '../services/geocodingService';
import type { GeocodedAddress } from '../services/geocodingService';

const cityCoords: Record<AllowedCity, { lat: number; lng: number }> = {
  Mendonk: { lat: 51.105, lng: 3.765 },
  'Sint-Kruis-Winkel': { lat: 51.110, lng: 3.825 },
  Wachtebeke: { lat: 51.150, lng: 3.900 },
};

const defaultZoom = 14;

const HomeBaseOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState<AllowedCity | ''>('');
  const [selectedAddress, setSelectedAddress] = useState<GeocodedAddress | null>(null);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [houseNumberWarning, setHouseNumberWarning] = useState<string | undefined>(undefined);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  // All hooks must be called before any early return
  React.useEffect(() => {
    if (!user) return;
    if (selectedAddress && selectedAddress.properties.housenumber) {
      setHouseNumber(selectedAddress.properties.housenumber);
    }
  }, [selectedAddress, user]);

  React.useEffect(() => {
    if (!user) return;
    if (selectedAddress) {
      setMarker({
        lat: selectedAddress.geometry.coordinates[1],
        lng: selectedAddress.geometry.coordinates[0],
      });
    } else if (city) {
      setMarker(cityCoords[city as AllowedCity]);
    } else {
      setMarker(null);
    }
  }, [selectedAddress, city, user]);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const shouldUpdate = selectedAddress && houseNumber && city;
    if (!shouldUpdate) return;
    async function updateMarker() {
      const details = await getAddressDetails(
        selectedAddress!.properties.street || selectedAddress!.properties.name,
        houseNumber,
        city
      );
      if (details && !cancelled) {
        setMarker({
          lat: details.geometry.coordinates[1],
          lng: details.geometry.coordinates[0],
        });
      }
    }
    updateMarker();
    return () => {
      cancelled = true;
    };
  }, [houseNumber, selectedAddress, city, user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !city || !selectedAddress) {
      setSubmitError('Please select a city and address.');
      return;
    }
    if (!houseNumber) {
      setSubmitError('Please enter your house number.');
      return;
    }
    try {
      // Use forward geocoding for the most accurate result
      const details = await getAddressDetails(
        selectedAddress.properties.street || selectedAddress.properties.name,
        houseNumber,
        city
      );
      if (!details) {
        setSubmitError('Could not find coordinates for this address. Please check your input.');
        return;
      }
      if (!details.properties.housenumber) {
        setHouseNumberWarning('Warning: The geocoder could not confirm your house number. Your marker may be approximate.');
      } else {
        setHouseNumberWarning(undefined);
      }
      await homeBaseService.createHomeBase({
        user_id: user.id,
        city: city as AllowedCity,
        street: details.properties.street,
        number: houseNumber,
        lat: details.geometry.coordinates[1],
        lng: details.geometry.coordinates[0],
      });
      setSubmitError(undefined);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (e) {
      setSubmitError((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div style={{ background: '#ffeeba', color: '#856404', padding: 8, borderRadius: 4, marginBottom: 8 }}>
            [DEBUG] Onboarding form rendering. User: {user ? user.id : 'none'} | Success: {String(success)}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose Your Home Base
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select your permanent home base location. This cannot be changed later.
          </p>
        </div>
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md text-center font-semibold relative">
            🎉 Home base set successfully! Redirecting to your homepage...
            <button
              onClick={() => navigate('/')}
              className="absolute top-2 right-2 text-green-800 hover:text-green-600 text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-700">City</label>
            <select
              id="city-select"
              value={city}
              onChange={e => {
                setCity(e.target.value as AllowedCity);
                setSelectedAddress(null);
                setHouseNumber('');
              }}
              className="form-input w-full"
            >
              <option value="">Select a city</option>
              {Object.keys(cityCoords).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <AddressAutocomplete
              city={city as AllowedCity}
              onSelect={setSelectedAddress}
              label="Address"
              key={city} // reset input when city changes
            />
          </div>
          <div>
            <label htmlFor="house-number-input" className="block text-sm font-medium text-gray-700">House Number</label>
            <input
              id="house-number-input"
              type="text"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              className="form-input w-full"
              placeholder="e.g. 90"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={success}
          >
            Set Home Base
          </button>
        </form>
        {houseNumberWarning && (
          <div className="text-yellow-700 text-sm mt-2" role="alert">{houseNumberWarning}</div>
        )}
        {submitError && (
          <div className="text-red-600 text-sm mt-2" role="alert" data-testid="onboarding-error">{submitError}</div>
        )}
        <div className="mt-6">
          <MapContainer
            center={marker || { lat: 51.12, lng: 3.8 }}
            zoom={defaultZoom}
            style={{ height: 300, width: '100%', borderRadius: 12 }}
            scrollWheelZoom={false}
            key={city + (selectedAddress?.properties.name || '') + houseNumber}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {marker && (
              <Marker position={marker} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) as Icon}>
                <Popup>
                  {selectedAddress?.properties.name}
                  {selectedAddress?.properties.postcode && `, ${selectedAddress?.properties.postcode}`}
                  {selectedAddress?.properties.city && `, ${selectedAddress?.properties.city}`}
                  {houseNumber && <div>House number: {houseNumber}</div>}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default HomeBaseOnboardingPage; 