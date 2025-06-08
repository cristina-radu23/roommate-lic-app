import { useState } from "react";
import { StepProps } from "./types";
import { useCallback } from "react"

const StepFive = ({ formData, setFormData, onNext, onBack, displayedStep }: StepProps) => {
  const [error, setError] = useState("");

  // Upload a single photo to the backend and return the URL
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch('http://localhost:5000/api/listings/upload-photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.url ? `http://localhost:5000${data.url}` : null;
    } catch (err) {
      setError('Failed to upload photo.');
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = useCallback(() => {
    if (!formData.photos || formData.photos.length === 0 || !formData.title || !formData.description) {
      setError("Please complete all required fields.");
      return;
    }
  
    setError("");
    onNext?.();
  }, [formData, onNext]);
  


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
            <h3 className="mb-4 text-start">Step {displayedStep ?? 5}: Photos & Description</h3>

            {/* Form content */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Photos *</label>
              <div className="d-flex flex-wrap gap-3">
                {formData.photos?.map((photo, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={photo}
                      alt={`preview-${idx}`}
                      style={{
                        width: "120px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "50%",
                      }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          photos: prev.photos?.filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="photoUpload"
                  style={{
                    width: "120px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed #ccc",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "28px",
                    color: "#777",
                  }}
                >
                  +
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files) return;
                      const newFiles = Array.from(files);
                      // Upload each file and get URLs
                      const uploadPromises = newFiles.map(uploadPhoto);
                      const urls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
                      if (urls.length > 0) {
                        setFormData((prev) => ({
                          ...prev,
                          photos: [...(prev.photos || []), ...urls],
                        }));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Title of the listing *</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            {/* Description */}
            <div className="mb-4 text-start">
              <label className="form-label fw-bold">Description *</label>
              <textarea
                className="form-control"
                name="description"
                rows={5}
                value={formData.description || ""}
                onChange={handleChange}
                style={{ borderRadius: "8px" }}
              />
            </div>

            {error && <div className="text-danger mb-3">{error}</div>}

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

export default StepFive;
