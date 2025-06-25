import React, { useState } from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepFiveProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepFive: React.FC<StepFiveProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  const [newLanguage, setNewLanguage] = useState('');

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
    'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish',
    'Russian', 'Ukrainian', 'Arabic', 'Hebrew', 'Persian', 'Hindi',
    'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indonesian'
  ];

  const handleLanguageAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newLanguage.trim()) {
      e.preventDefault();
      if (!formData.preferredLanguages.includes(newLanguage.trim())) {
        updateFormData({
          preferredLanguages: [...formData.preferredLanguages, newLanguage.trim()]
        });
      }
      setNewLanguage('');
    }
  };

  const handleLanguageRemove = (language: string) => {
    updateFormData({
      preferredLanguages: formData.preferredLanguages.filter(l => l !== language)
    });
  };

  const handleLanguageSelect = (language: string) => {
    if (!formData.preferredLanguages.includes(language)) {
      updateFormData({
        preferredLanguages: [...formData.preferredLanguages, language]
      });
    }
  };

  return (
    <div className="step-container">
      <h3 className="step-title">Language & Cultural Preferences</h3>
      <p className="step-description">
        Help us understand your language preferences and cultural openness.
      </p>

      <div className="form-group">
        <label>Preferred languages (if any)</label>
        <div className="tag-input">
          {formData.preferredLanguages.map((language, index) => (
            <span key={index} className="tag">
              {language}
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleLanguageRemove(language)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Type a language and press Enter..."
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyPress={handleLanguageAdd}
          />
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          Add languages you'd prefer your roommate to speak
        </small>
        
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px', display: 'block' }}>
            Common languages:
          </label>
          <div className="checkbox-group" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {commonLanguages.map((language) => (
              <label
                key={language}
                className={`checkbox-item ${formData.preferredLanguages.includes(language) ? 'selected' : ''}`}
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                onClick={() => handleLanguageSelect(language)}
              >
                <input
                  type="checkbox"
                  checked={formData.preferredLanguages.includes(language)}
                  readOnly
                />
                {language}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Open to roommates from any background?</label>
        <div className="radio-group">
          <label className={`radio-item ${formData.openToAnyBackground === true ? 'selected' : ''}`}>
            <input
              type="radio"
              name="openToAnyBackground"
              value="true"
              checked={formData.openToAnyBackground === true}
              onChange={() => updateFormData({ openToAnyBackground: true })}
            />
            Yes, I'm open to roommates from any background
          </label>
          <label className={`radio-item ${formData.openToAnyBackground === false ? 'selected' : ''}`}>
            <input
              type="radio"
              name="openToAnyBackground"
              value="false"
              checked={formData.openToAnyBackground === false}
              onChange={() => updateFormData({ openToAnyBackground: false })}
            />
            No, I have specific preferences
          </label>
        </div>
      </div>

      {formData.openToAnyBackground === false && (
        <div className="form-group">
          <label>Cultural background preferences (optional)</label>
          <textarea
            placeholder="Please describe any specific cultural background preferences you have..."
            value={formData.culturalComments || ''}
            onChange={(e) => updateFormData({ culturalComments: e.target.value })}
            rows={4}
          />
          <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
            This helps us find better matches while respecting your preferences
          </small>
        </div>
      )}

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

export default StepFive; 