import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepOne: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferredGenderChange = (gender: string) => {
    setFormData((prev: any) => {
      const current = prev.preferredGender || [];
      const updated = current.includes(gender)
        ? current.filter((g: string) => g !== gender)
        : [...current, gender];
      return { ...prev, preferredGender: updated };
    });
  };

  const canProceed = formData.age >= 18 && formData.gender;

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 1: Basic Information</h2>
        <p>Tell us about yourself</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="fullName">Full Name (optional)</label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName || ''}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Your name"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age *</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 18)}
            min="18"
            max="100"
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="form-control"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Gender of Roommate *</label>
          <div className="checkbox-group modern-checkbox-group">
            {['male', 'female'].map((gender) => (
              <label key={gender} className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={formData.preferredGender?.includes(gender) || false}
                  onChange={() => handlePreferredGenderChange(gender)}
                />
                <span className="modern-checkmark"></span>
                <span className="checkbox-text">{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
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

export default StepOne; 