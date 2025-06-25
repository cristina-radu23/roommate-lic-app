import React, { useState, useEffect } from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepTwoProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface CityOption {
  cityId: string;
  cityName: string;
}

const StepTwo: React.FC<StepTwoProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cities');
        if (response.ok) {
          const cities = await response.json();
          setCityOptions(cities);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const arrangementOptions = [
    { value: 'join-current', label: 'Join me in my current place' },
    { value: 'find-together', label: 'Find a place together' },
    { value: 'join-other', label: 'I want to join someone else\'s place' }
  ];

  const handleLocationAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newLocation.trim()) {
      e.preventDefault();
      if (!formData.preferredLocations.includes(newLocation.trim())) {
        updateFormData({
          preferredLocations: [...formData.preferredLocations, newLocation.trim()]
        });
      }
      setNewLocation('');
    }
  };

  const handleLocationRemove = (location: string) => {
    updateFormData({
      preferredLocations: formData.preferredLocations.filter(l => l !== location)
    });
  };

  const handleLocationToggle = (location: string) => {
    const current = formData.preferredLocations;
    const updated = current.includes(location)
      ? current.filter(l => l !== location)
      : [...current, location];
    updateFormData({ preferredLocations: updated });
  };

  const handleArrangementToggle = (value: string) => {
    const current = formData.arrangementTypes;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFormData({ arrangementTypes: updated });
  };

  const handleNext = () => {
    if (formData.arrangementTypes.length > 0 && formData.moveInDate && formData.budgetMin && formData.budgetMax) {
      onNext();
    }
  };

  if (loading) {
    return (
      <div className="step-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading cities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      <h3 className="step-title">Living Preferences</h3>
      <p className="step-description">
        Tell us about your living situation preferences and budget requirements.
      </p>

      <div className="form-group">
        <label>Type of arrangement you're open to</label>
        <div className="checkbox-group">
          {arrangementOptions.map((option) => (
            <label
              key={option.value}
              className={`checkbox-item ${formData.arrangementTypes.includes(option.value) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.arrangementTypes.includes(option.value)}
                onChange={() => handleArrangementToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Move-in date (preferred)</label>
        <input
          type="date"
          value={formData.moveInDate}
          onChange={(e) => updateFormData({ moveInDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group">
        <label>Budget range (€/month)</label>
        <div className="range-group">
          <input
            type="range"
            min="200"
            max="2000"
            step="50"
            value={formData.budgetMin}
            onChange={(e) => updateFormData({ budgetMin: parseInt(e.target.value) })}
          />
          <span className="range-value">€{formData.budgetMin}</span>
          <span>to</span>
          <input
            type="range"
            min="200"
            max="2000"
            step="50"
            value={formData.budgetMax}
            onChange={(e) => updateFormData({ budgetMax: parseInt(e.target.value) })}
          />
          <span className="range-value">€{formData.budgetMax}</span>
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          Set your minimum and maximum monthly budget
        </small>
      </div>

      <div className="form-group">
        <label>Preferred location(s)</label>
        <div className="checkbox-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {cityOptions.map((city) => (
            <label
              key={city.cityId}
              className={`checkbox-item ${formData.preferredLocations.includes(city.cityName) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.preferredLocations.includes(city.cityName)}
                onChange={() => handleLocationToggle(city.cityName)}
              />
              {city.cityName}
            </label>
          ))}
        </div>
        
        <div className="mt-3">
          <label style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px', display: 'block' }}>
            Add other locations:
          </label>
          <input
            type="text"
            placeholder="Type a location and press Enter..."
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={handleLocationAdd}
            className="form-control"
          />
        </div>

        {formData.preferredLocations.length > 0 && (
          <div className="mt-3">
            <label style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px', display: 'block' }}>
              Selected locations:
            </label>
            <div className="tag-input">
              {formData.preferredLocations.map((location, index) => (
                <span key={index} className="tag">
                  {location}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleLocationRemove(location)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          Select cities from the list above or add custom locations
        </small>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          disabled={formData.arrangementTypes.length === 0 || !formData.moveInDate || !formData.budgetMin || !formData.budgetMax}
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default StepTwo; 