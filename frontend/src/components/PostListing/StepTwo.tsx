import { useState } from "react";
import { PostListingFormData } from "./types";

type StepTwoProps = {
  formData: PostListingFormData;
  setFormData: (data: PostListingFormData) => void;
  onNext: () => void;
  onBack: () => void;
};

const amenitiesList = [
  "TV", "WiFi", "Air Conditioning", "Parking", "Heating",
  "Washing Machine", "Elevator", "Furnished", "Garden", "Terrace",
];

const rulesList = ["Smoker friendly", "Pet friendly"];

const StepTwo = ({ formData, setFormData, onNext, onBack }: StepTwoProps) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleIncrement = (field: keyof PostListingFormData) => {
    const current = formData[field] as number || 0;
    setFormData({ ...formData, [field]: current + 1 });
  };
  
  const handleDecrement = (field: keyof PostListingFormData) => {
    const current = formData[field] as number || 0;
    setFormData({ ...formData, [field]: Math.max(0, current - 1) });
  };
  
  const toggleItem = (field: "amenities" | "rules", item: string) => {
    const list = formData[field] || [];
    const updatedList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  
    setFormData({ ...formData, [field]: updatedList });
  };

  const handleNext = () => {
    if (!formData.size || isNaN(Number(formData.size))) {
      setError("Please enter the size of the property.");
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
            <h3 className="mb-4 text-start">Step 2: Property Information</h3>

            {/* Size */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">What is the size of the property? *</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  name="size"
                  className="form-control"
                  placeholder="e.g. 85"
                  value={formData.size || ""}
                  onChange={handleChange}
                  style={{ borderRadius: "8px" }}
                />
                <span>m²</span>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">How many bedrooms?</label>
              <div className="d-flex gap-4">
                <div>
                  <div>Single</div>
                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleDecrement("singleBedrooms")}>-</button>
                    <span>{formData.singleBedrooms || 0}</span>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleIncrement("singleBedrooms")}>+</button>
                  </div>
                </div>
                <div>
                  <div>Double</div>
                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleDecrement("doubleBedrooms")}>-</button>
                    <span>{formData.doubleBedrooms || 0}</span>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleIncrement("doubleBedrooms")}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Flatmates */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Do you have any flatmates?</label>
              <div className="d-flex gap-4">
                {(
                  ["femaleFlatmates", "maleFlatmates"] as (keyof PostListingFormData)[]
                ).map((field, i) => {
                  const label = ["Female", "Male"][i];

                  return (
                    <div key={field}>
                      <div>{label}</div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleDecrement(field)}
                        >
                          -
                        </button>
                        <span>{formData[field] || 0}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleIncrement(field)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Amenities</label>
              <div className="d-flex flex-wrap gap-2">
                {amenitiesList.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn btn-sm ${
                      formData.amenities?.includes(item)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => toggleItem("amenities", item)}
                  >
                    {formData.amenities?.includes(item) ? `-${item}` : `+${item}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">House Rules</label>
              <div className="d-flex flex-wrap gap-2">
                {rulesList.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn btn-sm ${
                      formData.rules?.includes(item)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => toggleItem("rules", item)}
                  >
                    {formData.rules?.includes(item) ? `-${item}` : `+${item}`}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="text-danger mb-2">{error}</div>}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between">
              <button 
                onClick={onBack}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#f8f9fa",
                  borderColor: "#dee2e6",
                  color: "#212529",
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
                <span style={{ width: "100%", textAlign: "center" }}>Back</span>
              </button>
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

export default StepTwo;
