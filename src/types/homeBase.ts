/**
 * Represents a city in Oost-Vlaanderen where a home base can be set.
 */
export type AllowedCity = 'Mendonk' | 'Sint-Kruis-Winkel' | 'Wachtebeke';

/**
 * Represents a player's home base address and location.
 */
export interface HomeBase {
  user_id: string;
  city: AllowedCity;
  street: string;
  number: string;
  lat: number;
  lng: number;
  created_at?: string;
} 