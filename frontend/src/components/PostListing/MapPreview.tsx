import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  address: string;
};

const MapPreview = ({ address }: Props) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        console.log("Fetching coordinates for address:", address);
        const encodedAddress = encodeURIComponent(address);
        console.log("Encoded address:", encodedAddress);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
        console.log("Geocoding URL:", url);
        
        const res = await fetch(url);
        const data = await res.json();
        console.log("Geocoding response:", data);
        
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log("Setting position:", [lat, lon]);
          setPosition([lat, lon]);
          setError(null);

          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 15);
          }
        } else {
          setError("No coordinates found for this address");
        }
      } catch (err) {
        console.error("Error fetching coordinates:", err);
        setError("Failed to fetch coordinates");
      }
    };

    if (address) {
      fetchCoordinates();
    }
  }, [address]);

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  if (!position) {
    return <div>Loading map...</div>;
  }

  return (
    <div style={{ height: "400px", width: "100%", marginBottom: "2rem" }}>
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        ref={(ref) => {
          if (ref && !mapRef.current) {
            mapRef.current = ref;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker 
          position={position}
          icon={L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41]
          })}
        >
          <Popup>Property Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPreview;
