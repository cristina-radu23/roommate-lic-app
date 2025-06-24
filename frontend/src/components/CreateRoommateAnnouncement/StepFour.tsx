import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepFour: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 4: Personality & Habits</h2>
        <p>Tell us about your lifestyle choices</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>Do you smoke? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="smoking"
                value="yes"
                checked={formData.smoking === 'yes'}
                onChange={(e) => handleInputChange('smoking', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="smoking"
                value="no"
                checked={formData.smoking === 'no'}
                onChange={(e) => handleInputChange('smoking', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              No
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Do you drink alcohol? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="drinking"
                value="yes"
                checked={formData.drinking === 'yes'}
                onChange={(e) => handleInputChange('drinking', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="drinking"
                value="no"
                checked={formData.drinking === 'no'}
                onChange={(e) => handleInputChange('drinking', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              No
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="drinking"
                value="occasionally"
                checked={formData.drinking === 'occasionally'}
                onChange={(e) => handleInputChange('drinking', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Occasionally
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Do you have pets? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="hasPets"
                value="yes"
                checked={formData.hasPets === 'yes'}
                onChange={(e) => handleInputChange('hasPets', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="hasPets"
                value="no"
                checked={formData.hasPets === 'no'}
                onChange={(e) => handleInputChange('hasPets', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              No
            </label>
          </div>
        </div>

        {formData.hasPets === 'yes' && (
          <div className="form-group">
            <label htmlFor="petType">What type of pets?</label>
            <input
              type="text"
              id="petType"
              value={formData.petType || ''}
              onChange={(e) => handleInputChange('petType', e.target.value)}
              placeholder="e.g., Dog, Cat, Fish, etc."
              className="form-control"
            />
          </div>
        )}

        <div className="form-group">
          <label>Are you okay living with pets? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="okayWithPets"
                value="yes"
                checked={formData.okayWithPets === 'yes'}
                onChange={(e) => handleInputChange('okayWithPets', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="okayWithPets"
                value="no"
                checked={formData.okayWithPets === 'no'}
                onChange={(e) => handleInputChange('okayWithPets', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              No
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="okayWithPets"
                value="depends"
                checked={formData.okayWithPets === 'depends'}
                onChange={(e) => handleInputChange('okayWithPets', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Depends
            </label>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepFour; 