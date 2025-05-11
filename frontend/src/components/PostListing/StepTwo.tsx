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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    <div className="container-fluid mt-4"style={{ maxWidth: "800px", margin: "0 auto", minWidth:"800px" }}>
      <div className="row" style={{marginBottom:"90px", marginTop:"90px"}}>
        <div className="col-12 col-md-12">
          <h3 className="mb-4 text-start">Step 2: Property</h3>

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
            <label className="form-label fw-bold">Property amenities:</label>
            <div className="mb-2">
              {formData.amenities?.join(", ") || "None selected"}
            </div>
            <div className="d-flex flex-wrap gap-2">
              {amenitiesList.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`btn btn-sm ${formData.amenities?.includes(item) ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => toggleItem("amenities", item)}
                >
                  {formData.amenities?.includes(item) ? `-${item}` : `+${item}`}

                </button>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">House rules:</label>
            <div className="mb-2">
              {formData.rules?.join(", ") || "None selected"}
            </div>
            <div className="d-flex flex-wrap gap-2">
              {rulesList.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`btn btn-sm ${formData.rules?.includes(item) ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => toggleItem("rules", item)}
                >
                  {formData.rules?.includes(item) ? `-${item}` : `+${item}`}

                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="text-danger mb-2">{error}</div>}

          {/* Navigation */}
          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={onBack}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
