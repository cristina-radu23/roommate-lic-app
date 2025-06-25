import React from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepOneProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ formData, updateFormData, onNext }) => {
  const handleNext = () => {
    if (formData.preferredAgeMin && formData.preferredAgeMax) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h3 className="step-title">Basic Preferences</h3>
      <p className="step-description">
        Let's start with the basics. Tell us about your preferred age range and gender preference for your ideal roommate.
      </p>

      <div className="form-group">
        <label>Preferred Age Range</label>
        <div className="range-group">
          <input
            type="range"
            min="18"
            max="70"
            value={formData.preferredAgeMin}
            onChange={(e) => updateFormData({ preferredAgeMin: parseInt(e.target.value) })}
          />
          <span className="range-value">{formData.preferredAgeMin}</span>
          <span>to</span>
          <input
            type="range"
            min="18"
            max="70"
            value={formData.preferredAgeMax}
            onChange={(e) => updateFormData({ preferredAgeMax: parseInt(e.target.value) })}
          />
          <span className="range-value">{formData.preferredAgeMax}</span>
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          Drag the sliders to set your preferred age range
        </small>
      </div>

      <div className="form-group">
        <label>Preferred Gender</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.preferredGender === 'male' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="preferredGender"
              value="male"
              checked={formData.preferredGender === 'male'}
              onChange={(e) => updateFormData({ preferredGender: e.target.value as any })}
            />
            Male
          </label>
          <label className={`radio-item ${formData.preferredGender === 'female' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="preferredGender"
              value="female"
              checked={formData.preferredGender === 'female'}
              onChange={(e) => updateFormData({ preferredGender: e.target.value as any })}
            />
            Female
          </label>
          <label className={`radio-item ${formData.preferredGender === 'no-preference' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="preferredGender"
              value="no-preference"
              checked={formData.preferredGender === 'no-preference'}
              onChange={(e) => updateFormData({ preferredGender: e.target.value as any })}
            />
            No preference
          </label>
        </div>
      </div>

      <div className="step-actions">
        <div></div>
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={!formData.preferredAgeMin || !formData.preferredAgeMax}
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default StepOne; 