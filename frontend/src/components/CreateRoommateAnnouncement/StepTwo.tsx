import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepTwo: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (location: string) => {
    setFormData((prev: any) => {
      const current = prev.preferredLocations || [];
      const updated = current.includes(location)
        ? current.filter((l: string) => l !== location)
        : [...current, location];
      return { ...prev, preferredLocations: updated };
    });
  };

  const canProceed = formData.lookingFor && formData.moveInDate && formData.budget > 0;

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 2: Living Situation</h2>
        <p>What are you looking for?</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="lookingFor">Looking for *</label>
          <select
            id="lookingFor"
            value={formData.lookingFor}
            onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            className="form-control"
            required
          >
            <option value="">Select what you're looking for</option>
            <option value="room-shared">Room in a shared apartment</option>
            <option value="find-together">Someone to join me in finding a place</option>
            <option value="take-over-lease">Someone to take over a lease/sublet</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="moveInDate">Move-in Date *</label>
          <input
            type="date"
            id="moveInDate"
            value={formData.moveInDate}
            onChange={(e) => handleInputChange('moveInDate', e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget (monthly rent) *</label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
              min="0"
              className="form-control"
              placeholder="Monthly rent budget"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Location(s) *</label>
          <div className="checkbox-group modern-checkbox-group">
            {['Cluj-Napoca', 'Bucharest', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Arad', 'Brăila'].map((location) => (
              <label key={location} className="modern-checkbox">
                <input
                  type="checkbox"
                  checked={formData.preferredLocations?.includes(location) || false}
                  onChange={() => handleLocationChange(location)}
                />
                <span className="modern-checkmark"></span>
                <span className="checkbox-text">{location}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add other locations (comma separated)"
            className="form-control mt-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value) {
                  handleLocationChange(value);
                  e.currentTarget.value = '';
                }
              }
            }}
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
          disabled={!canProceed}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepTwo; 