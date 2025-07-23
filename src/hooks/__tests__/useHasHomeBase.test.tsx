import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { useHasHomeBase } from '../useHasHomeBase';
import * as homeBaseServiceModule from '../../services/homeBaseService';
import { vi } from 'vitest';

// Mock user
const mockUser = { id: 'user-123' };

describe('useHasHomeBase', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false if no user', async () => {
    const { result } = renderHook(() => useHasHomeBase(null));
    expect(result.current).toBe(false);
  });

  it('returns null initially (loading)', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'getHomeBaseByUserId').mockResolvedValue(null);
    const { result } = renderHook(() => useHasHomeBase(mockUser));
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());
  });

  it('returns true if user has a home base', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'getHomeBaseByUserId').mockResolvedValue({ user_id: mockUser.id, city: 'Mendonk', street: 'Main', number: '1', lat: 0, lng: 0 });
    const { result } = renderHook(() => useHasHomeBase(mockUser));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('returns false if user does not have a home base', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'getHomeBaseByUserId').mockResolvedValue(null);
    const { result } = renderHook(() => useHasHomeBase(mockUser));
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('returns false if service throws', async () => {
    vi.spyOn(homeBaseServiceModule.homeBaseService, 'getHomeBaseByUserId').mockRejectedValue(new Error('error'));
    const { result } = renderHook(() => useHasHomeBase(mockUser));
    await waitFor(() => expect(result.current).toBe(false));
  });
}); 