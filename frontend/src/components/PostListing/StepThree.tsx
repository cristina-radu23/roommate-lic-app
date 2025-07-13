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

            {/* Room Amenities */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Room Amenities</label>
              <div className="d-flex flex-wrap gap-2">
                {roomAmenitiesList.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn btn-sm ${
                      formData.roomAmenities?.includes(item)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => toggleAmenity(item)}
                  >
                    {formData.roomAmenities?.includes(item) ? `-${item}` : `+${item}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Has Bed */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Does the room have a bed?</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="hasBed"
                    id="hasBedYes"
                    value="yes"
                    checked={formData.hasBed === "yes"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="hasBedYes">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="hasBed"
                    id="hasBedNo"
                    value="no"
                    checked={formData.hasBed === "no"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="hasBedNo">No</label>
                </div>
              </div>
            </div>

            {/* Bed Type (if hasBed is yes) */}
            {formData.hasBed === "yes" && (
              <div className="mb-4 text-start">
                <label className="form-label fw-bold">Bed Type</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="bedType"
                      id="bedTypeSingle"
                      value="single"
                      checked={formData.bedType === "single"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="bedTypeSingle">Single Bed</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="bedType"
                      id="bedTypeDouble"
                      value="double"
                      checked={formData.bedType === "double"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="bedTypeDouble">Double Bed</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="bedType"
                      id="bedTypeSofa"
                      value="sofa_bed"
                      checked={formData.bedType === "sofa_bed"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="bedTypeSofa">Sofa Bed</label>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
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

export default StepThree;
