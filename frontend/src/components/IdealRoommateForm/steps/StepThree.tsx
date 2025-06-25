import React from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepThreeProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  const occupationOptions = [
    { value: 'student', label: 'Student' },
    { value: 'professional', label: 'Professional' },
    { value: 'remote-worker', label: 'Remote worker' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'no-preference', label: 'No preference' }
  ];

  const workScheduleOptions = [
    { value: '9-to-5', label: '9 to 5' },
    { value: 'night-shift', label: 'Night shift' },
    { value: 'remote', label: 'Remote worker' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'no-preference', label: 'No preference' }
  ];

  const handleOccupationToggle = (value: string) => {
    const current = formData.preferredOccupationTypes;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFormData({ preferredOccupationTypes: updated });
  };

  const handleWorkScheduleToggle = (value: string) => {
    const current = formData.preferredWorkSchedules;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFormData({ preferredWorkSchedules: updated });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="step-container">
      <h3 className="step-title">Lifestyle Compatibility</h3>
      <p className="step-description">
        Help us understand your lifestyle preferences to find a compatible roommate.
      </p>

      <div className="form-group">
        <label>Occupation types you prefer (if any)</label>
        <div className="checkbox-group">
          {occupationOptions.map((option) => (
            <label
              key={option.value}
              className={`checkbox-item ${formData.preferredOccupationTypes.includes(option.value) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.preferredOccupationTypes.includes(option.value)}
                onChange={() => handleOccupationToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Preferred work schedules</label>
        <div className="checkbox-group">
          {workScheduleOptions.map((option) => (
            <label
              key={option.value}
              className={`checkbox-item ${formData.preferredWorkSchedules.includes(option.value) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.preferredWorkSchedules.includes(option.value)}
                onChange={() => handleWorkScheduleToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Do you prefer a roommate who smokes?</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.smokingPreference === 'yes' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="smokingPreference"
              value="yes"
              checked={formData.smokingPreference === 'yes'}
              onChange={(e) => updateFormData({ smokingPreference: e.target.value as any })}
            />
            Yes
          </label>
          <label className={`radio-item ${formData.smokingPreference === 'no' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="smokingPreference"
              value="no"
              checked={formData.smokingPreference === 'no'}
              onChange={(e) => updateFormData({ smokingPreference: e.target.value as any })}
            />
            No
          </label>
          <label className={`radio-item ${formData.smokingPreference === 'doesnt-matter' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="smokingPreference"
              value="doesnt-matter"
              checked={formData.smokingPreference === 'doesnt-matter'}
              onChange={(e) => updateFormData({ smokingPreference: e.target.value as any })}
            />
            Doesn't matter
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Okay with pets?</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.petPreference === 'yes' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="petPreference"
              value="yes"
              checked={formData.petPreference === 'yes'}
              onChange={(e) => updateFormData({ petPreference: e.target.value as any })}
            />
            Yes
          </label>
          <label className={`radio-item ${formData.petPreference === 'no' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="petPreference"
              value="no"
              checked={formData.petPreference === 'no'}
              onChange={(e) => updateFormData({ petPreference: e.target.value as any })}
            />
            No
          </label>
          <label className={`radio-item ${formData.petPreference === 'depends' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="petPreference"
              value="depends"
              checked={formData.petPreference === 'depends'}
              onChange={(e) => updateFormData({ petPreference: e.target.value as any })}
            />
            Depends on the pet
          </label>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next Step
        </button>
      </div>
    </div>
  );
};

export default StepThree; 