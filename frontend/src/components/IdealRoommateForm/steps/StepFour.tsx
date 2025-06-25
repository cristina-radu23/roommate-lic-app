import React from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepFourProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepFour: React.FC<StepFourProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  const getCleanlinessLabel = (value: number) => {
    switch (value) {
      case 1: return 'Very relaxed';
      case 2: return 'Relaxed';
      case 3: return 'Moderate';
      case 4: return 'Clean';
      case 5: return 'Very clean';
      default: return 'Moderate';
    }
  };

  const getNoiseLabel = (value: number) => {
    switch (value) {
      case 1: return 'Very quiet';
      case 2: return 'Quiet';
      case 3: return 'Moderate';
      case 4: return 'Social';
      case 5: return 'Very social';
      default: return 'Moderate';
    }
  };

  return (
    <div className="step-container">
      <h3 className="step-title">Cleanliness & Personality</h3>
      <p className="step-description">
        Help us understand your preferences for cleanliness, sociability, and daily routines.
      </p>

      <div className="form-group">
        <label>How clean should your roommate be?</label>
        <div className="range-group">
          <input
            type="range"
            min="1"
            max="5"
            value={formData.cleanlinessPreference}
            onChange={(e) => updateFormData({ cleanlinessPreference: parseInt(e.target.value) })}
          />
          <span className="range-value">{getCleanlinessLabel(formData.cleanlinessPreference)}</span>
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          1 = Very relaxed, 5 = Very clean
        </small>
      </div>

      <div className="form-group">
        <label>Preferred sociability</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.sociabilityPreference === 'very-social' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sociabilityPreference"
              value="very-social"
              checked={formData.sociabilityPreference === 'very-social'}
              onChange={(e) => updateFormData({ sociabilityPreference: e.target.value as any })}
            />
            Very social
          </label>
          <label className={`radio-item ${formData.sociabilityPreference === 'friendly-private' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sociabilityPreference"
              value="friendly-private"
              checked={formData.sociabilityPreference === 'friendly-private'}
              onChange={(e) => updateFormData({ sociabilityPreference: e.target.value as any })}
            />
            Friendly but private
          </label>
          <label className={`radio-item ${formData.sociabilityPreference === 'quiet-independent' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sociabilityPreference"
              value="quiet-independent"
              checked={formData.sociabilityPreference === 'quiet-independent'}
              onChange={(e) => updateFormData({ sociabilityPreference: e.target.value as any })}
            />
            Quiet and independent
          </label>
          <label className={`radio-item ${formData.sociabilityPreference === 'no-preference' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sociabilityPreference"
              value="no-preference"
              checked={formData.sociabilityPreference === 'no-preference'}
              onChange={(e) => updateFormData({ sociabilityPreference: e.target.value as any })}
            />
            No strong preference
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Preferred quietness/noise level</label>
        <div className="range-group">
          <input
            type="range"
            min="1"
            max="5"
            value={formData.noiseLevelPreference}
            onChange={(e) => updateFormData({ noiseLevelPreference: parseInt(e.target.value) })}
          />
          <span className="range-value">{getNoiseLabel(formData.noiseLevelPreference)}</span>
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          1 = Very quiet, 5 = Very social
        </small>
      </div>

      <div className="form-group">
        <label>Sleeping schedule preference</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.sleepSchedulePreference === 'early-bird' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sleepSchedulePreference"
              value="early-bird"
              checked={formData.sleepSchedulePreference === 'early-bird'}
              onChange={(e) => updateFormData({ sleepSchedulePreference: e.target.value as any })}
            />
            Early bird
          </label>
          <label className={`radio-item ${formData.sleepSchedulePreference === 'night-owl' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sleepSchedulePreference"
              value="night-owl"
              checked={formData.sleepSchedulePreference === 'night-owl'}
              onChange={(e) => updateFormData({ sleepSchedulePreference: e.target.value as any })}
            />
            Night owl
          </label>
          <label className={`radio-item ${formData.sleepSchedulePreference === 'doesnt-matter' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sleepSchedulePreference"
              value="doesnt-matter"
              checked={formData.sleepSchedulePreference === 'doesnt-matter'}
              onChange={(e) => updateFormData({ sleepSchedulePreference: e.target.value as any })}
            />
            Doesn't matter
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Okay with frequent guests?</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.guestPreference === 'yes' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="guestPreference"
              value="yes"
              checked={formData.guestPreference === 'yes'}
              onChange={(e) => updateFormData({ guestPreference: e.target.value as any })}
            />
            Yes
          </label>
          <label className={`radio-item ${formData.guestPreference === 'no' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="guestPreference"
              value="no"
              checked={formData.guestPreference === 'no'}
              onChange={(e) => updateFormData({ guestPreference: e.target.value as any })}
            />
            No
          </label>
          <label className={`radio-item ${formData.guestPreference === 'sometimes' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="guestPreference"
              value="sometimes"
              checked={formData.guestPreference === 'sometimes'}
              onChange={(e) => updateFormData({ guestPreference: e.target.value as any })}
            />
            Sometimes
          </label>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Next Step
        </button>
      </div>
    </div>
  );
};

export default StepFour; 