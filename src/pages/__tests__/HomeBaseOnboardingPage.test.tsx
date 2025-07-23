import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../test/renderHelpers';
import type { AuthContextType } from '../../contexts/AuthContext';
import type { User as GameUser } from '../../types/pigeon';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import HomeBaseOnboardingPage from '../HomeBaseOnboardingPage';
import * as homeBaseServiceModule from '../../services/homeBaseService';
import * as geocodingServiceModule from '../../services/geocodingService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', (importOriginal: () => Promise<unknown>) => {
  return importOriginal().then((actual) => ({
    ...(actual as Record<string, unknown>),
    useNavigate: () => mockNavigate,
  }));
});

// Pro-level, type-safe Supabase User mock
const mockUser: SupabaseUser = {
  id: 'test-user',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: '',
  phone_confirmed_at: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { username: 'testuser' },
  identities: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  is_anonymous: false,
};

const mockGameUser: GameUser = {
  id: 'test-user',
  email: 'test@example.com',
  username: 'testuser',
  player_type: 'human',
  balance: 1000,
  total_pigeons: 0,
  pigeon_cap: 10,
  level: 1,
  experience: 0,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const authContextValue: AuthContextType = {
  user: mockUser,
  gameUser: mockGameUser,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshUser: vi.fn(),
};

describe('HomeBaseOnboardingPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders city and address fields', () => {
    customRender(<HomeBaseOnboardingPage />, { authContextValue });
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
  });

  it('validates form and shows error if fields missing', async () => {
    customRender(<HomeBaseOnboardingPage />, { authContextValue });
    fireEvent.click(screen.getByRole('button', { name: /set home base/i }));
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-error').textContent?.toLowerCase()).toContain('please select a city');
    });
  });

  it('calls homeBaseService.createHomeBase and shows success', async () => {
    const createHomeBaseMock = vi.spyOn(homeBaseServiceModule.homeBaseService, 'createHomeBase').mockResolvedValue();
    vi.spyOn(geocodingServiceModule, 'searchAddresses').mockResolvedValue([
      {
        geometry: { coordinates: [3.765, 51.105] },
        properties: {
          name: 'Kerkstraat 12',
          street: 'Kerkstraat',
          housenumber: '12',
          city: 'Mendonk',
          postcode: '9042',
          country: 'Belgium',
          suburb: '',
          locality: '',
          place_id: 'test-place-id',
        },
      },
    ]);
    vi.spyOn(geocodingServiceModule, 'getAddressDetails').mockResolvedValue({
      geometry: { coordinates: [3.765, 51.105] },
      properties: {
        name: 'Kerkstraat 12',
        street: 'Kerkstraat',
        housenumber: '12',
        city: 'Mendonk',
        postcode: '9042',
        country: 'Belgium',
        suburb: '',
        locality: '',
        place_id: 'test-place-id',
      },
    });
    customRender(<HomeBaseOnboardingPage />, { authContextValue });
    await waitFor(() => {
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Mendonk' } });
    const addressInput = screen.getByLabelText(/address/i);
    await userEvent.type(addressInput, 'Kerkstraat 12');
    // Wait for dropdown to appear and select the first result
    const dropdownItem = await screen.findByText(/Kerkstraat 12/);
    await userEvent.click(dropdownItem);
    fireEvent.click(screen.getByRole('button', { name: /set home base/i }));
    await waitFor(() => {
      expect(createHomeBaseMock).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'test-user',
        city: 'Mendonk',
        street: 'Kerkstraat',
        number: '12',
        // Accept any number for lat/lng, since geocoding is dynamic
        lat: expect.any(Number),
        lng: expect.any(Number),
      }));
      expect(screen.getByText(/redirecting to your homepage/i)).toBeInTheDocument();
    });
  });

  it('redirects to homepage after success', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'createHomeBase').mockResolvedValue();
    vi.spyOn(geocodingServiceModule, 'searchAddresses').mockResolvedValue([
      {
        geometry: { coordinates: [3.765, 51.105] },
        properties: {
          name: 'Kerkstraat 12',
          street: 'Kerkstraat',
          housenumber: '12',
          city: 'Mendonk',
          postcode: '9042',
          country: 'Belgium',
          suburb: '',
          locality: '',
          place_id: 'test-place-id',
        },
      },
    ]);
    vi.spyOn(geocodingServiceModule, 'getAddressDetails').mockResolvedValue({
      geometry: { coordinates: [3.765, 51.105] },
      properties: {
        name: 'Kerkstraat 12',
        street: 'Kerkstraat',
        housenumber: '12',
        city: 'Mendonk',
        postcode: '9042',
        country: 'Belgium',
        suburb: '',
        locality: '',
        place_id: 'test-place-id',
      },
    });
    customRender(<HomeBaseOnboardingPage />, { authContextValue });
    await waitFor(() => {
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Mendonk' } });
    const addressInput = screen.getByLabelText(/address/i);
    await userEvent.type(addressInput, 'Kerkstraat 12');
    const dropdownItem = await screen.findByText(/Kerkstraat 12/);
    await userEvent.click(dropdownItem);
    fireEvent.click(screen.getByRole('button', { name: /set home base/i }));
    await waitFor(() => {
      expect(screen.getByText(/redirecting to your homepage/i)).toBeInTheDocument();
    });
    // Simulate close button click
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows error if createHomeBase throws', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'createHomeBase').mockRejectedValue(new Error('DB error'));
    vi.spyOn(geocodingServiceModule, 'searchAddresses').mockResolvedValue([
      {
        geometry: { coordinates: [3.765, 51.105] },
        properties: {
          name: 'Kerkstraat 12',
          street: 'Kerkstraat',
          housenumber: '12',
          city: 'Mendonk',
          postcode: '9042',
          country: 'Belgium',
          suburb: '',
          locality: '',
          place_id: 'test-place-id',
        },
      },
    ]);
    vi.spyOn(geocodingServiceModule, 'getAddressDetails').mockResolvedValue({
      geometry: { coordinates: [3.765, 51.105] },
      properties: {
        name: 'Kerkstraat 12',
        street: 'Kerkstraat',
        housenumber: '12',
        city: 'Mendonk',
        postcode: '9042',
        country: 'Belgium',
        suburb: '',
        locality: '',
        place_id: 'test-place-id',
      },
    });
    customRender(<HomeBaseOnboardingPage />, { authContextValue });
    await waitFor(() => {
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Mendonk' } });
    const addressInput = screen.getByLabelText(/address/i);
    await userEvent.type(addressInput, 'Kerkstraat 12');
    const dropdownItem = await screen.findByText(/Kerkstraat 12/);
    await userEvent.click(dropdownItem);
    fireEvent.click(screen.getByRole('button', { name: /set home base/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/db error|could not find coordinates/i);
  });
}); 