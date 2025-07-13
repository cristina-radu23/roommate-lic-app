import { useState, useEffect } from "react";
import { PostListingFormData } from "./types";
import MapPreview from "./MapPreview";
import Select from "react-select";
import { SingleValue } from "react-select";

type StepOneProps = {
  formData: PostListingFormData;
  setFormData: (data: PostListingFormData) => void;
  onNext: () => void;
};

const StepOne = ({ formData, setFormData, onNext }: StepOneProps) => {
  const [error, setError] = useState("");
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);


  interface CityOption {
    value: string;
    label: string;
  }

  interface CityFromApi {
    cityId: string;
    cityName: string;
  }

  useEffect(() => {
    const fetchCities = async (): Promise<void> => {
      try {
        const res = await fetch("http://localhost:5000/api/cities");
        const data: CityFromApi[] = await res.json();
  
        const formatted: CityOption[] = data.map((city) => ({
          value: city.cityId, // use cityId instead of name
          label: city.cityName,
        }));
  
        setCityOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
  
    fetchCities();
  }, []);

  const handleCityChange = (selected: SingleValue<CityOption>) => {
    if (selected) {
      setFormData({ 
        ...formData, 
        cityId: selected.value, 
        cityName: selected.label 
      });
    }
  };
  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleNext = () => {
    if (!formData.listingType || !formData.propertyType || !formData.userType) {
      setError("Please complete all required fields.");
      return;
    }

    setError("");
    onNext();
  };

  

  return (
    <div className="container-fluid" style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "28px" }}>
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm" style={{ 
            borderRadius: "15px", 
            backgroundColor: "white",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <h3 className="mb-4 text-start">Step 1: Getting Started</h3>

            {/* What are you listing? */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">What are you listing? *</label>
              <div className="form-check">
                <input
                  type="radio"
                  name="listingType"
                  value="room"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.listingType === "room"}
                />
                <label className="form-check-label">A room</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  name="listingType"
                  value="entire_property"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.listingType === "entire_property"}
                />
                <label className="form-check-label">The entire property</label>
              </div>
            </div>

            {/* Property type */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">What is the type of property? *</label>
              <div className="form-check">
                <input
                  type="radio"
                  name="propertyType"
                  value="apartment"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.propertyType === "apartment"}
                />
                <label className="form-check-label">Apartment</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  name="propertyType"
                  value="house"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.propertyType === "house"}
                />
                <label className="form-check-label">House</label>
              </div>
            </div>

            {/* Who are you? */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Who are you? *</label>
              <div className="form-check">
                <input
                  type="radio"
                  name="userType"
                  value="owner"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.userType === "owner"}
                />
                <label className="form-check-label">Owner of the Property</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  name="userType"
                  value="tenant"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.userType === "tenant"}
                />
                <label className="form-check-label">Tenant</label>
              </div>
              <div className="form-check mt-1">
                <input
                  type="checkbox"
                  name="livesInProperty"
                  className="form-check-input"
                  onChange={handleChange}
                  checked={formData.livesInProperty || false}
                />
                <label className="form-check-label">I am living in the property</label>
              </div>
            </div>

            {/* Location Info */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">City *</label>
              <Select
                options={cityOptions}
                value={cityOptions.find(opt => opt.value === formData.cityId)}
                onChange={handleCityChange}
                placeholder="Select or type a city..."
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderRadius: "8px",
                    border: "1px solid #ced4da"
                  })
                }}
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Street *</label>
              <input
                type="text"
                name="streetName"
                className="form-control mb-2"
                value={formData.streetName || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
              <label className="form-label fw-bold">Street Number *</label>
              <input
                type="text"
                name="streetNo"
                className="form-control"
                value={formData.streetNo || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            {/* Map Preview */}
            <div className="mb-4">
              {formData.cityName && formData.streetName && formData.streetNo && (
                <MapPreview address={`${formData.streetName} ${formData.streetNo}, ${formData.cityName}`} />
              )}
            </div>

            {/* Error */}
            {error && <div className="text-danger mb-2">{error}</div>}

            {/* Continue Button */}
            <div className="d-flex justify-content-end">
              <button 
                onClick={handleNext}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#a1cca7",
                  borderColor: "#a1cca7",
                  color: "white",
                  width: "18%",
                  display: "flex !important",
                  justifyContent: "center !important",
                  alignItems: "center !important",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "1px solid",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <span style={{ width: "100%", textAlign: "center" }}>Continue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
