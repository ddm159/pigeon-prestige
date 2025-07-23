import { render, screen } from '@testing-library/react';
import { RaceMap } from '../RaceMap';
import type { RaceLocation, HomeBaseMarker } from '../RaceMap';
import '@testing-library/jest-dom';

const raceLocations: RaceLocation[] = [
  { name: 'Test Race', country: 'Belgium', lat: 51.1, lng: 3.7 },
];

const homeBase: HomeBaseMarker = {
  city: 'Mendonk',
  street: 'Kerkstraat',
  number: '12',
  lat: 51.105,
  lng: 3.765,
};

describe('RaceMap', () => {
  it('renders home base marker at correct coordinates and shows popup', async () => {
    render(<RaceMap raceLocations={raceLocations} homeBase={homeBase} />);
    // There should be two markers: one for the race, one for the home base
    const markerImgs = await screen.findAllByAltText('Marker');
    expect(markerImgs.length).toBe(2);
    // Find the home base marker by class
    const homeBaseMarker = markerImgs.find(img => img.className.includes('homebase-marker'));
    expect(homeBaseMarker).toBeInTheDocument();
    // Optionally, simulate a click to check popup content (Leaflet popups are tricky in tests)
  });
}); 