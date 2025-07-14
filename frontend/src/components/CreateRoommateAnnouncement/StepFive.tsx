import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepFive: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 5: Cleanliness & Lifestyle Preferences</h2>
        <p>How do you like to live?</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>How clean are you? *</label>
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.cleanlinessLevel}
              onChange={(e) => handleInputChange('cleanlinessLevel', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>1 - Messy</span>
              <span>5 - Very tidy</span>
            </div>
            <div className="slider-value">Level: {formData.cleanlinessLevel}</div>
          </div>
        </div>

        <div className="form-group">
          <label>Are you more social or private at home? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="socialPreference"
                value="very-social"
                checked={formData.socialPreference === 'very-social'}
                onChange={(e) => handleInputChange('socialPreference', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              I love hanging out
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="socialPreference"
                value="moderate"
                checked={formData.socialPreference === 'moderate'}
                onChange={(e) => handleInputChange('socialPreference', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Moderate
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="socialPreference"
                value="private"
                checked={formData.socialPreference === 'private'}
                onChange={(e) => handleInputChange('socialPreference', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              I prefer quiet time
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>How quiet/noisy is your lifestyle? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="noiseLevel"
                value="very-quiet"
                checked={formData.noiseLevel === 'very-quiet'}
                onChange={(e) => handleInputChange('noiseLevel', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Very quiet
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="noiseLevel"
                value="moderate"
                checked={formData.noiseLevel === 'moderate'}
                onChange={(e) => handleInputChange('noiseLevel', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Moderate
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="noiseLevel"
                value="noisy"
                checked={formData.noiseLevel === 'noisy'}
                onChange={(e) => handleInputChange('noiseLevel', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Noisy
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Sleeping schedule *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="sleepSchedule"
                value="early-bird"
                checked={formData.sleepSchedule === 'early-bird'}
                onChange={(e) => handleInputChange('sleepSchedule', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Early bird
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sleepSchedule"
                value="night-owl"
                checked={formData.sleepSchedule === 'night-owl'}
                onChange={(e) => handleInputChange('sleepSchedule', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Night owl
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sleepSchedule"
                value="depends"
                checked={formData.sleepSchedule === 'depends'}
                onChange={(e) => handleInputChange('sleepSchedule', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Depends
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Visitors/friends over often? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="visitorsOften"
                value="yes"
                checked={formData.visitorsOften === 'yes'}
                onChange={(e) => handleInputChange('visitorsOften', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="visitorsOften"
                value="no"
                checked={formData.visitorsOften === 'no'}
                onChange={(e) => handleInputChange('visitorsOften', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              No
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="visitorsOften"
                value="sometimes"
                checked={formData.visitorsOften === 'sometimes'}
                onChange={(e) => handleInputChange('visitorsOften', e.target.value)}
              />
              <span className="radio-checkmark"></span>
              Sometimes
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

export default StepFive; 