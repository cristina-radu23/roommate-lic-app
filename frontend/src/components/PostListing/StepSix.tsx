import { StepProps } from "./types";

type StepSixProps = StepProps & {
  setSubmitted: (value: boolean) => void;
  isEditing?: boolean;
  listingId?: string;
};

const StepSix = ({ formData, onBack, displayedStep, setSubmitted, isEditing, listingId }: StepSixProps) => {
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        listingType: formData.listingType,
        propertyType: formData.propertyType,
        userRole: formData.userType,
        livesInProperty: formData.livesInProperty || false,

        // Address
        cityId: formData.cityId,
        streetName: formData.streetName,
        streetNo: formData.streetNo,

        // Property details
        sizeM2: formData.size || 0,
        bedroomsSingle: formData.singleBedrooms || 0,
        bedroomsDouble: formData.doubleBedrooms || 0,
        flatmatesFemale: formData.femaleFlatmates || 0,
        flatmatesMale: formData.maleFlatmates || 0,

        // Availability & pricing
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo || null,
        openEnded: formData.openEnded || false,
        rent: formData.rent || 0,
        deposit: formData.noDeposit ? null : formData.deposit || null,
        noDeposit: formData.noDeposit || false,

        // Room-specific
        roomSizeM2: formData.listingType === "room" ? formData.roomSize || null : null,
        hasBed: formData.listingType === "room" ? formData.hasBed === "yes" : false,
        bedType:
          formData.listingType === "room" && formData.hasBed === "yes"
            ? formData.bedType || null
            : null,

        title: formData.title,
        description: formData.description,

        // Associations
        roomAmenities: formData.roomAmenities || [],
        propertyAmenities: formData.amenities || [],
        houseRules: formData.rules || [],
        photos: formData.photos || [],
      };

      const url = isEditing && listingId 
        ? `http://localhost:5000/api/listings/${listingId}`
        : "http://localhost:5000/api/listings";
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'submit'} listing`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert(`Error ${isEditing ? 'updating' : 'submitting'} listing. Please try again.`);
    }
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
            <h3 className="mb-4 text-start">Step {displayedStep ?? 6}: Review & Submit</h3>

            <div className="mb-3 text-start">
              <strong>Title:</strong>
              <p>{formData.title || "-"}</p>
            </div>

            <div className="mb-3 text-start">
              <strong>Description:</strong>
              <p>{formData.description || "-"}</p>
            </div>

            <div className="mb-3 text-start">
              <strong>Address:</strong>
              <p>
                {formData.cityName || "-"}, {formData.streetName || "-"} {formData.streetNo || ""}
              </p>
            </div>

            <div className="mb-3 text-start">
              <strong>Monthly Rent:</strong>
              <p>{formData.rent ? `${formData.rent} EUR` : "-"}</p>
            </div>

            <div className="mb-4 text-start">
              <strong>Photos:</strong>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {formData.photos && formData.photos.length > 0 ? (
                  formData.photos.map((photo, idx) => (
                    <img
                      key={idx}
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
                  ))
                ) : (
                  <p className="text-muted">No photos uploaded.</p>
                )}
              </div>
            </div>

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
                onClick={handleSubmit}
                style={{ 
                  borderRadius: "8px",
                  padding: "0.5rem 2rem",
                  backgroundColor: "#a1cca7",
                  borderColor: "#a1cca7",
                  color: "white",
                  width: "25%"
                }}
              >
                {isEditing ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSix;
