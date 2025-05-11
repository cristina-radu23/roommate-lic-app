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
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });
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
    <div className="container-fluid mt-4" style={{ maxWidth: "800px", margin: "0 auto", minWidth:"800px" }}>
      <div className="row">
        <div className="col-12 col-md-12">
          <h3 className="mb-4 text-start">Step 3: Room</h3>

          {/* Room size */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Size of the room:*</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="number"
                name="roomSize"
                className="form-control"
                value={formData.roomSize || ""}
                onChange={handleChange}
              />
              <span>m²</span>
            </div>
          </div>

          {/* Has bed */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Does it have a bed?</label>
            <div className="form-check">
              <input
                type="radio"
                name="hasBed"
                value="yes"
                className="form-check-input"
                onChange={handleChange}
                checked={formData.hasBed === "yes"}
              />
              <label className="form-check-label">Yes</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                name="hasBed"
                value="no"
                className="form-check-input"
                onChange={handleChange}
                checked={formData.hasBed === "no"}
              />
              <label className="form-check-label">No</label>
            </div>
          </div>

          {/* Bed type (conditional) */}
          {formData.hasBed === "yes" && (
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Choose bed type:</label>
              {["sofa bed", "single bed", "double bed"].map((type) => (
                <div className="form-check" key={type}>
                  <input
                    type="radio"
                    name="bedType"
                    value={type}
                    className="form-check-input"
                    onChange={handleChange}
                    checked={formData.bedType === type}
                  />
                  <label className="form-check-label text-capitalize">{type}</label>
                </div>
              ))}
            </div>
          )}

          {/* Room amenities */}
          <div className="mb-4 text-start">
            <label className="form-label fw-bold">Room amenities:</label>
            <div className="mb-2">
              {formData.roomAmenities?.join(", ") || "None selected"}
            </div>
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

          {error && <div className="text-danger mb-2">{error}</div>}

          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={onBack}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
