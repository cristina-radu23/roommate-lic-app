import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepSix: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData((prev: any) => {
      const current = prev.languages || [];
      const updated = current.includes(language)
        ? current.filter((l: string) => l !== language)
        : [...current, language];
      return { ...prev, languages: updated };
    });
  };

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 6: Language & Culture</h2>
        <p>Tell us about your background</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>Languages you speak *</label>
          <div className="checkbox-group">
            {['Romanian', 'English', 'Hungarian', 'German', 'French', 'Spanish', 'Italian'].map((language) => (
              <label key={language} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.languages?.includes(language) || false}
                  onChange={() => handleLanguageChange(language)}
                />
                <span className="checkmark"></span>
                {language}
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add other languages (comma separated)"
            className="form-control mt-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value) {
                  handleLanguageChange(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="culturalBackground">Cultural background or other info (optional)</label>
          <textarea
            id="culturalBackground"
            value={formData.culturalBackground || ''}
            onChange={(e) => handleInputChange('culturalBackground', e.target.value)}
            placeholder="Tell us about your cultural background, traditions, or any other relevant information..."
            className="form-control"
            rows={4}
          />
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

export default StepSix; 