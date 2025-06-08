import { useState } from "react";
import { PostListingFormData } from "./types";

type StepThreeProps = {
  formData: PostListingFormData;
  setFormData: (data: PostListingFormData) => void;
  onNext: () => void;
  onBack: () => void;
};

const roomAmenitiesList = ["Furnished", "Private Bathroom", "Balcony", "Air Conditioner"];

const StepThree = ({ formData, setFormData, onNext, onBack }: StepThreeProps) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleAmenity = (item: string) => {
    const current = formData.roomAmenities || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFormData({ ...formData, roomAmenities: updated });
  };

  const handleNext = () => {
    if (!formData.roomSize || isNaN(Number(formData.roomSize))) {
      setError("Please enter the size of the room.");
      return;
    }

    if (formData.hasBed === "yes" && !formData.bedType) {
      setError("Please select a bed type.");
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
            <h3 className="mb-4 text-start">Step 3: Room Details</h3>

            {/* Form content */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Room Size (m²) *</label>
              <input
                type="number"
                name="roomSize"
                className="form-control"
                value={formData.roomSize || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Number of Female Flatmates</label>
              <input
                type="number"
                name="femaleFlatmates"
                className="form-control"
                value={formData.femaleFlatmates || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Number of Male Flatmates</label>
              <input
                type="number"
                name="maleFlatmates"
                className="form-control"
                value={formData.maleFlatmates || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            {/* Error */}
            {error && <div className="text-danger mb-2">{error}</div>}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between">
              <button 
                className="btn" 
                onClick={onBack}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#f8f9fa",
                  borderColor: "#dee2e6",
                  color: "#212529",
                  width: "25%"
                }}
              >
                Back
              </button>
              <button 
                className="btn" 
                onClick={handleNext}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#a1cca7",
                  borderColor: "#a1cca7",
                  color: "white",
                  width: "25%"
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
