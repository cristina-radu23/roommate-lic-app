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
    <div className="container-fluid mt-4" style={{ maxWidth: "800px", margin: "0 auto", minWidth:"800px" }}>
      <div className="row">
        <div className="col-12 col-md-12">
          <h3 className="mb-4 text-start">Step {displayedStep ?? 4}: Rental Details</h3>

          {/* Availability */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Set availability *</label>
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">From:</label>
                <input
                  type="date"
                  name="availableFrom"
                  className="form-control"
                  value={formData.availableFrom || ""}
                  onChange={handleChange}
                />
              </div>

              <div className={`col-md-4 ${formData.openEnded ? "invisible" : ""}`}>
                <label className="form-label">To:</label>
                <input
                  type="date"
                  name="availableTo"
                  className="form-control"
                  value={formData.availableTo || ""}
                  onChange={handleChange}
                  disabled={formData.openEnded}
                />
              </div>



              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="openEnded"
                    className="form-check-input"
                    checked={formData.openEnded || false}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">No end date</label>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Monthly Rent *</label>
            <div className="input-group">
              <input
                type="number"
                name="rent"
                className="form-control"
                value={formData.rent || ""}
                onChange={handleChange}
                min={0}
              />
              <span className="input-group-text">EUR</span>
            </div>
          </div>

          {/* Deposit */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Deposit</label>
            <div className="input-group">
              <input
                type="number"
                name="deposit"
                className="form-control"
                value={formData.noDeposit ? "" : formData.deposit || ""}
                onChange={handleChange}
                disabled={formData.noDeposit}
                min={0}
              />
              <span className="input-group-text">EUR</span>
            </div>
            <div className="form-check mt-2">
              <input
                type="checkbox"
                name="noDeposit"
                className="form-check-input"
                checked={formData.noDeposit || false}
                onChange={handleChange}
              />
              <label className="form-check-label">No deposit needed</label>
            </div>
          </div>

          {error && <div className="text-danger mb-3">{error}</div>}

          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={onBack}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFour;
