import React, { useState, useEffect } from "react";
import { FilterCriteria } from "./types";

const amenitiesList = [
  "TV", "WiFi", "Air Conditioning", "Parking", "Heating",
  "Washing Machine", "Elevator", "Furnished", "Garden", "Terrace",
];
const rulesList = ["Smoker friendly", "Pet friendly"];
const roomAmenitiesList = ["Furnished", "Private Bathroom", "Balcony", "Air Conditioner"];

const roommateOptions = [
  { value: "female", label: "Females" },
  { value: "male", label: "Males" },
  { value: "any", label: "No preference" },
];

interface HomePageFilterPanelProps {
  onApply: (criteria: FilterCriteria) => void;
  onClose?: () => void;
  initialFilters?: FilterCriteria;
}

const HomePageFilterPanel: React.FC<HomePageFilterPanelProps> = ({ onApply, onClose, initialFilters = {} }) => {
  const [minRent, setMinRent] = useState<number | "">(initialFilters.minRent || "");
  const [maxRent, setMaxRent] = useState<number | "">(initialFilters.maxRent || "");
  const [listingType, setListingType] = useState<"room" | "entire_property" | "">(initialFilters.listingType as "room" | "entire_property" || "");
  const [propertyType, setPropertyType] = useState<"apartment" | "house" | "">(initialFilters.propertyType as "apartment" | "house" || "");
  const [preferredRoommate, setPreferredRoommate] = useState<"female" | "male" | "any">(initialFilters.preferredRoommate as "female" | "male" | "any" || "any");
  const [amenities, setAmenities] = useState<string[]>(initialFilters.amenities || []);
  const [rules, setRules] = useState<string[]>(initialFilters.rules || []);
  const [roomAmenities, setRoomAmenities] = useState<string[]>(initialFilters.roomAmenities || []);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const apply = () => {
    onApply({
      minRent: minRent === "" ? undefined : Number(minRent),
      maxRent: maxRent === "" ? undefined : Number(maxRent),
      listingType: listingType || undefined,
      propertyType: propertyType || undefined,
      preferredRoommate: preferredRoommate !== "any" ? preferredRoommate : undefined,
      amenities,
      rules,
      roomAmenities,
    });
    if (onClose) onClose();
  };

  return (
    <div className="card p-4 shadow">
      <h5 className="mb-3">Filter Options</h5>
      <div className="mb-2">
        <label>Budget interval (EUR/month)</label>
        <div className="d-flex gap-2">
          <input type="number" className="form-control" placeholder="Min" value={minRent} onChange={e => setMinRent(e.target.value === "" ? "" : Number(e.target.value))} />
          <input type="number" className="form-control" placeholder="Max" value={maxRent} onChange={e => setMaxRent(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
      </div>
      <div className="mb-2">
        <label>Looking for:</label>
        <div className="d-flex gap-2">
          <div className="form-check">
            <input type="radio" className="form-check-input" id="room" name="listingType" value="room" checked={listingType === "room"} onChange={() => setListingType("room")} />
            <label className="form-check-label" htmlFor="room">A room</label>
          </div>
          <div className="form-check">
            <input type="radio" className="form-check-input" id="entire_property" name="listingType" value="entire_property" checked={listingType === "entire_property"} onChange={() => setListingType("entire_property")} />
            <label className="form-check-label" htmlFor="entire_property">The entire property</label>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label>Type of property:</label>
        <div className="d-flex gap-2">
          <div className="form-check">
            <input type="radio" className="form-check-input" id="apartment" name="propertyType" value="apartment" checked={propertyType === "apartment"} onChange={() => setPropertyType("apartment")} />
            <label className="form-check-label" htmlFor="apartment">Apartment</label>
          </div>
          <div className="form-check">
            <input type="radio" className="form-check-input" id="house" name="propertyType" value="house" checked={propertyType === "house"} onChange={() => setPropertyType("house")} />
            <label className="form-check-label" htmlFor="house">House</label>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label>Preferred Roommates:</label>
        <div className="d-flex gap-2">
          {roommateOptions.map(opt => (
            <div className="form-check" key={opt.value}>
              <input 
                type="radio" 
                className="form-check-input" 
                id={opt.value} 
                name="preferredRoommate" 
                value={opt.value} 
                checked={preferredRoommate === opt.value} 
                onChange={() => setPreferredRoommate(opt.value as "female" | "male" | "any")} 
              />
              <label className="form-check-label" htmlFor={opt.value}>{opt.label}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label>Property amenities:</label>
        <div className="d-flex flex-wrap gap-2">
          {amenitiesList.map(item => (
            <button key={item} type="button" className={`btn btn-sm ${amenities.includes(item) ? "btn-primary" : "btn-outline-primary"}`} onClick={() => toggleItem(amenities, setAmenities, item)}>
              {amenities.includes(item) ? `✓ ${item}` : item}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label>House rules:</label>
        <div className="d-flex flex-wrap gap-2">
          {rulesList.map(item => (
            <button key={item} type="button" className={`btn btn-sm ${rules.includes(item) ? "btn-success" : "btn-outline-success"}`} onClick={() => toggleItem(rules, setRules, item)}>
              {rules.includes(item) ? `✓ ${item}` : item}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label>Room amenities:</label>
        <div className="d-flex flex-wrap gap-2">
          {roomAmenitiesList.map(item => (
            <button key={item} type="button" className={`btn btn-sm ${roomAmenities.includes(item) ? "btn-primary" : "btn-outline-primary"}`} onClick={() => toggleItem(roomAmenities, setRoomAmenities, item)}>
              {roomAmenities.includes(item) ? `✓ ${item}` : item}
            </button>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        {onClose && <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>}
        <button className="btn btn-primary" onClick={apply}>OK</button>
      </div>
    </div>
  );
};

export default HomePageFilterPanel; 