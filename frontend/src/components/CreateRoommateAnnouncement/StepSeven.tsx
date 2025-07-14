import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepSeven: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHobbyChange = (hobby: string) => {
    setFormData((prev: any) => {
      const current = prev.hobbies || [];
      const updated = current.includes(hobby)
        ? current.filter((h: string) => h !== hobby)
        : current.length < 3 
          ? [...current, hobby]
          : current;
      return { ...prev, hobbies: updated };
    });
  };

  const canProceed = formData.bio && formData.bio.trim().length > 0;

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 7: Hobbies & Interests</h2>
        <p>Tell us about yourself</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>Top 3 hobbies *</label>
          <div className="checkbox-group modern-checkbox-group">
            {[
              'Reading', 'Gaming', 'Sports', 'Music', 'Cooking', 'Traveling', 
              'Photography', 'Art', 'Dancing', 'Hiking', 'Swimming', 'Cycling',
              'Watching movies', 'Netflix', 'Gym', 'Yoga', 'Meditation', 'Writing'
            ].map((hobby) => (
              <label key={hobby} className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={formData.hobbies?.includes(hobby) || false}
                  onChange={() => handleHobbyChange(hobby)}
                  disabled={!formData.hobbies?.includes(hobby) && formData.hobbies?.length >= 3}
                />
                <span className="modern-checkmark"></span>
                <span className="checkbox-text">{hobby}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add other hobbies (max 3 total)"
            className="form-control mt-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && formData.hobbies?.length < 3) {
                  handleHobbyChange(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          {formData.hobbies?.length >= 3 && (
            <small className="text-muted">Maximum 3 hobbies selected</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Short bio *</label>
          <textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="e.g., 'I'm a freelance designer who loves hiking and quiet evenings. Looking for a chill roommate.'"
            className="form-control"
            rows={4}
            required
          />
          <small className="text-muted">
            Tell potential roommates about yourself and what you're looking for
          </small>
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
          disabled={!canProceed}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepSeven; 