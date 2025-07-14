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
    <div className="form-step step-five">
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
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.socialPreference === 'very-social'}
                onChange={() => handleInputChange('socialPreference', 'very-social')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">I love hanging out</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.socialPreference === 'moderate'}
                onChange={() => handleInputChange('socialPreference', 'moderate')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Moderate</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.socialPreference === 'private'}
                onChange={() => handleInputChange('socialPreference', 'private')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">I prefer quiet time</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>How quiet/noisy is your lifestyle? *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.noiseLevel === 'very-quiet'}
                onChange={() => handleInputChange('noiseLevel', 'very-quiet')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Very quiet</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.noiseLevel === 'moderate'}
                onChange={() => handleInputChange('noiseLevel', 'moderate')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Moderate</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.noiseLevel === 'noisy'}
                onChange={() => handleInputChange('noiseLevel', 'noisy')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Noisy</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Sleeping schedule *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.sleepSchedule === 'early-bird'}
                onChange={() => handleInputChange('sleepSchedule', 'early-bird')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Early bird</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.sleepSchedule === 'night-owl'}
                onChange={() => handleInputChange('sleepSchedule', 'night-owl')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Night owl</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.sleepSchedule === 'depends'}
                onChange={() => handleInputChange('sleepSchedule', 'depends')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Depends</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Visitors/friends over often? *</label>
          <div className="checkbox-group modern-checkbox-group">
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.visitorsOften === 'yes'}
                onChange={() => handleInputChange('visitorsOften', 'yes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Yes</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.visitorsOften === 'no'}
                onChange={() => handleInputChange('visitorsOften', 'no')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">No</span>
            </label>
            <label className="modern-checkbox">
              <input
                type="checkbox"
                checked={formData.visitorsOften === 'sometimes'}
                onChange={() => handleInputChange('visitorsOften', 'sometimes')}
              />
              <span className="modern-checkmark"></span>
              <span className="checkbox-text">Sometimes</span>
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