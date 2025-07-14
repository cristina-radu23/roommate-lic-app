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
    <div className="form-step step-four">
      <div className="step-header">
        <h2>Step 4: Personality & Habits</h2>
        <p>Tell us about your lifestyle choices</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>Do you smoke? *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.smoking === 'yes'}
                onChange={() => handleInputChange('smoking', 'yes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.smoking === 'no'}
                onChange={() => handleInputChange('smoking', 'no')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">No</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Do you drink alcohol? *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.drinking === 'yes'}
                onChange={() => handleInputChange('drinking', 'yes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.drinking === 'no'}
                onChange={() => handleInputChange('drinking', 'no')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">No</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.drinking === 'occasionally'}
                onChange={() => handleInputChange('drinking', 'occasionally')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Occasionally</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Do you have pets? *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.hasPets === 'yes'}
                onChange={() => handleInputChange('hasPets', 'yes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.hasPets === 'no'}
                onChange={() => handleInputChange('hasPets', 'no')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">No</span>
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
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.okayWithPets === 'yes'}
                onChange={() => handleInputChange('okayWithPets', 'yes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.okayWithPets === 'no'}
                onChange={() => handleInputChange('okayWithPets', 'no')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">No</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.okayWithPets === 'depends'}
                onChange={() => handleInputChange('okayWithPets', 'depends')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Depends</span>
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
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepFour; 