import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
  onSubmit?: () => void;
  loading?: boolean;
}

const StepEight: React.FC<StepProps> = ({ formData, setFormData, onBack, onSubmit, loading }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 8: Profile Picture (Optional)</h2>
        <p>Add a photo to make your announcement more personal</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="profilePicture">Upload an image</label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
          />
          <small className="text-muted">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </small>
        </div>

        <div className="form-summary">
          <h3>Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Age:</strong> {formData.age}
            </div>
            <div className="summary-item">
              <strong>Looking for:</strong> {formData.lookingFor === 'room-shared' ? 'Room in shared apartment' : 
                                           formData.lookingFor === 'find-together' ? 'Someone to find place together' : 
                                           'Someone to take over lease'}
            </div>
            <div className="summary-item">
              <strong>Budget:</strong> €{formData.budget}/month
            </div>
            <div className="summary-item">
              <strong>Move-in:</strong> {new Date(formData.moveInDate).toLocaleDateString()}
            </div>
            <div className="summary-item">
              <strong>Occupation:</strong> {formData.occupation}
            </div>
            <div className="summary-item">
              <strong>Smoking:</strong> {formData.smoking === 'yes' ? 'Yes' : 'No'}
            </div>
            <div className="summary-item">
              <strong>Pets:</strong> {formData.hasPets === 'yes' ? 'Yes' : 'No'}
            </div>
            <div className="summary-item">
              <strong>Cleanliness:</strong> Level {formData.cleanlinessLevel}/5
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          disabled={loading}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="btn btn-success"
        >
          {loading ? 'Creating...' : 'Create Announcement'}
        </button>
      </div>
    </div>
  );
};

export default StepEight; 