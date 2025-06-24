// SearchBar.tsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FilterCriteria } from "./HomePage";
import HomePageFilterPanel from "./HomePageFilterPanel";
import RoommateFilterPanel from "../RoommateAnnouncements/RoommateFilterPanel";
import homeBackground from "../../assets/Home.png";
import ReactDOM from 'react-dom';
import { FaFilter } from 'react-icons/fa';
import { CityCoordinates } from "../Map/MapComponent";

interface SearchBarProps {
  onSearch: (criteria: FilterCriteria, coordinates?: CityCoordinates) => void;
  isRoommateMode?: boolean;
  roommateFilters?: any;
  setRoommateFilters?: (filters: any) => void;
  preferredCities?: any[];
  setPreferredCities?: (cities: any[]) => void;
}

interface CityOption {
  value: string;
  label: string;
  latitude?: number;
  longitude?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isRoommateMode, roommateFilters, setRoommateFilters, preferredCities, setPreferredCities }) => {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterCriteria>({});

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cities");
        const data = await res.json();
        const formatted = data.map((city: { cityId: string; cityName: string; latitude?: number; longitude?: number }) => ({
          value: city.cityId,
          label: city.cityName,
          latitude: city.latitude,
          longitude: city.longitude,
        }));
        setCities(formatted);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, []);

  const handleSearch = () => {
    if (isRoommateMode) {
      onSearch({ ...roommateFilters, preferredCities: preferredCities?.map(c => c.value) });
    } else {
      const coordinates = selectedCity?.latitude && selectedCity?.longitude 
        ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
        : undefined;
      onSearch({ ...selectedFilters, city: selectedCity?.value }, coordinates);
    }
  };

  const handleCityChange = (option: CityOption | null) => {
    setSelectedCity(option);
  };

  const handlePreferredCitiesChange = (newValue: any, _actionMeta: any) => {
    setPreferredCities && setPreferredCities(newValue);
  };

  const hasActiveFilters = isRoommateMode
    ? Object.keys(roommateFilters || {}).length > 0
    : Object.keys(selectedFilters).length > 0;

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ 
        position: 'relative',
        width: "100%", 
        height:"350px",
        padding:"0px",
        backgroundColor: "#f0d4f3",
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
        opacity: 0.8
      }} />
      <div className="position-relative w-100" 
        style={{ 
          borderLeft:"0px",
          paddingLeft: "0px",
          marginLeft:"0px",
          height: "100%",
          backgroundColor: "transparent",
          width: "100vw",
          zIndex: 1
        }}
      >
   {/* Search bar container */}
   <div
          className="position-absolute start-50 top-50 translate-middle shadow d-flex justify-content-between align-items-center"
          style={{
            background: "white",
            borderRadius: "50px",
            padding: "10px 20px",
            width: "90%",
            maxWidth: "900px",
            zIndex: 1000,
          }}
        >
          <div style={{ flex: 2, minWidth: 0, position: 'relative', zIndex: 1000 }}>
            {isRoommateMode ? (
              <Select
                options={cities}
                value={preferredCities}
                onChange={handlePreferredCitiesChange}
                isMulti
                placeholder="Select preferred cities"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: "50px",
                    height: "42px",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 1000
                  }),
                  menuPortal: (provided) => ({
                    ...provided,
                    zIndex: 1000
                  })
                }}
                menuPortalTarget={document.body}
              />
            ) : (
              <Select
                options={cities}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder="Select a city"
                classNamePrefix="react-select"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: "50px",
                    height: "42px",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 1000
                  }),
                  menuPortal: (provided) => ({
                    ...provided,
                    zIndex: 1000
                  })
                }}
                menuPortalTarget={document.body}
              />
            )}
          </div>
          <button
            className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-outline-secondary'} ms-3`}
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaFilter />
            {hasActiveFilters && <span style={{ fontSize: '12px' }}>✓</span>}
          </button>
          <button
            className="btn ms-2"
            style={{ 
              minWidth: "100px", 
              borderRadius: "50px",
              backgroundColor: "#a1cca6",
              borderColor: "#a1cca6",
              color: "white"
            }}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {showFilters && ReactDOM.createPortal(
          <>
            {/* Overlay */}
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{
                background: "rgba(0,0,0,0.3)",
                zIndex: 9998,
                left: 0,
                top: 0,
              }}
              onClick={() => setShowFilters(false)}
            />
            {/* Modal filter panel */}
            <div
              className="position-fixed top-50 start-50 translate-middle"
              style={{
                zIndex: 9999,
                minWidth: 400,
                maxWidth: 600,
                width: "90vw",
                maxHeight: "90vh",
                overflowY: "auto",
                marginTop: "20px",
                transform: "translate(-50%, -35%)"
              }}
            >
              {isRoommateMode ? (
                <RoommateFilterPanel
                  initialFilters={roommateFilters || {}}
                  onApply={filters => {
                    setRoommateFilters && setRoommateFilters(filters);
                    setShowFilters(false);
                  }}
                  onClose={() => setShowFilters(false)}
                />
              ) : (
                <HomePageFilterPanel 
                  initialFilters={selectedFilters}
                  onApply={(criteria) => {
                    setSelectedFilters(criteria);
                    setShowFilters(false);
                  }} 
                  onClose={() => setShowFilters(false)} 
                />
              )}
            </div>
          </>,
          document.body
        )}
      </div>

    </div>
  );
};

export default SearchBar;
