import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RaceLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface HomeBaseMarker {
  city: string;
  street: string;
  number: string;
  lat: number;
  lng: number;
}

interface RaceMapProps {
  raceLocations: RaceLocation[];
  homeBase?: HomeBaseMarker;
}

const europeCenter = { lat: 47.0, lng: 4.0 };
const defaultZoom = 5.5;

export const RaceMap: React.FC<RaceMapProps> = ({ raceLocations, homeBase }) => {
  return (
    <MapContainer
      center={homeBase ? { lat: homeBase.lat, lng: homeBase.lng } : europeCenter}
      zoom={defaultZoom}
      style={{ height: 500, width: '100%', borderRadius: 16 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {raceLocations.map(loc => (
        <Marker
          key={loc.name}
          position={{ lat: loc.lat, lng: loc.lng }}
          icon={L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            className: 'race-marker',
          }) as Icon}
        >
          <Popup>
            <strong>{loc.name}</strong><br />
            {loc.country}<br />
            ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
          </Popup>
        </Marker>
      ))}
      {homeBase && (
        <Marker
          position={{ lat: homeBase.lat, lng: homeBase.lng }}
          icon={L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // blue home icon
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            className: 'homebase-marker',
          }) as Icon}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem' }}>🏠 Your Home Base</div>
              <div style={{ margin: '4px 0' }}>
                {homeBase.street} {homeBase.number}<br />
                {homeBase.city}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555' }}>
                <span aria-label="Coordinates">📍</span> {homeBase.lat.toFixed(5)}, {homeBase.lng.toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}; 