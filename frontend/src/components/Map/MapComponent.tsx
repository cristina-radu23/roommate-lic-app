import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// It's better to define this interface where it's used if it's not shared.
export interface CityCoordinates {
  lat: number;
  lng: number;
}

interface Listing {
  listingId: number;
  latitude: number;
  longitude: number;
  title: string;
  rent: number;
}

interface MapComponentProps {
  listings: Listing[];
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  center?: CityCoordinates;
}

// This component will handle map events, like moving or zooming.
const MapEvents: React.FC<{ 
  onBoundsChange: (bounds: L.LatLngBounds) => void,
  center?: CityCoordinates 
}> = ({ onBoundsChange, center }) => {
  const map = useMap();

  // This effect will fly to the selected city's coordinates
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 13);
    }
  }, [center, map]);

  // This hook listens for map movements
  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  return null;
};


const MapComponent: React.FC<MapComponentProps> = ({ listings, onBoundsChange, center }) => {
  const romaniaPosition: L.LatLngExpression = [45.9432, 24.9668]; // Centered on Romania

  return (
    <MapContainer center={romaniaPosition} zoom={7} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MarkerClusterGroup>
        {listings.map((listing: Listing) => (
          <Marker key={listing.listingId} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div>
                <strong>{listing.title}</strong>
                <p className="my-1">Rent: {listing.rent} EUR/month</p>
                <Link 
                  to={`/listing/${listing.listingId}`} 
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#a1cca6",
                    borderColor: "#a1cca6",
                    color: "white",
                    textDecoration: "none"
                  }}
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      <MapEvents onBoundsChange={onBoundsChange} center={center} />
    </MapContainer>
  );
};

export default MapComponent; 