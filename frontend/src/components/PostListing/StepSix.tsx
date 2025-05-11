import { StepProps } from "./types";

type StepSixProps = StepProps & {
  setSubmitted: (value: boolean) => void;
};

const StepSix = ({ formData, onBack, displayedStep, setSubmitted }: StepSixProps) => {
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
            ? formData.bedType === "sofa bed"
              ? "sofa_bed"
              : formData.bedType === "single bed"
              ? "single"
              : formData.bedType === "double bed"
              ? "double"
              : null
            : null,

        title: formData.title,
        description: formData.description,

        // Associations
        roomAmenities: formData.roomAmenities || [],
        propertyAmenities: formData.amenities || [],
        houseRules: formData.rules || [],
        photos: formData.photos || [],
      };

      const response = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit listing");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error submitting listing. Please try again.");
    }
  };

  return (
    <div className="container-fluid mt-4" style={{ maxWidth: "800px", margin: "0 auto", minWidth: "800px" }}>
      <div className="row">
        <div className="col-12 col-md-10">
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

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-secondary" onClick={onBack}>
              Back
            </button>
            <button className="btn btn-success" onClick={handleSubmit}>
              Submit Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSix;
