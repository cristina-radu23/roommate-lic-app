import { useState } from "react";
import { StepProps } from "./types";

const StepFour = ({ formData, setFormData, onNext, onBack, displayedStep }: StepProps) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleNext = () => {
    if (!formData.availableFrom || !formData.rent) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    onNext?.();
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
            <h3 className="mb-4 text-start">Step {displayedStep ?? 4}: Availability & Pricing</h3>

            {/* Form content */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Available From *</label>
              <input
                type="date"
                name="availableFrom"
                className="form-control"
                value={formData.availableFrom || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Available To</label>
              <input
                type="date"
                name="availableTo"
                className="form-control"
                value={formData.availableTo || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            <div className="mb-4 text-start">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="openEnded"
                  className="form-check-input"
                  checked={formData.openEnded || false}
                  onChange={handleChange}
                />
                <label className="form-check-label">Open-ended availability</label>
              </div>
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Monthly Rent (€) *</label>
              <input
                type="number"
                name="rent"
                className="form-control"
                value={formData.rent || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Deposit (€)</label>
              <input
                type="number"
                name="deposit"
                className="form-control"
                value={formData.deposit || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
                disabled={formData.noDeposit}
              />
            </div>

            <div className="mb-4 text-start">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="noDeposit"
                  className="form-check-input"
                  checked={formData.noDeposit || false}
                  onChange={handleChange}
                />
                <label className="form-check-label">No deposit required</label>
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

export default StepFour;
