import React, { useState } from 'react';
import { AnnouncementFilters } from '../../types/roommate';
import './SearchFilters.css';

interface SearchFiltersProps {
  filters: AnnouncementFilters;
  onSearch: (filters: AnnouncementFilters) => void;
  onClear: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onSearch, onClear }) => {
  const [localFilters, setLocalFilters] = useState<AnnouncementFilters>(filters);

  const handleInputChange = (field: keyof AnnouncementFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  return (
    <div className="search-filters">
      <h3>Search & Filters</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search announcements..."
            value={localFilters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="budgetMin">Budget Range (€)</label>
          <div className="budget-inputs">
            <input
              type="number"
              id="budgetMin"
              placeholder="Min"
              value={localFilters.budgetMin || ''}
              onChange={(e) => handleInputChange('budgetMin', e.target.value ? Number(e.target.value) : undefined)}
            />
            <span>-</span>
            <input
              type="number"
              id="budgetMax"
              placeholder="Max"
              value={localFilters.budgetMax || ''}
              onChange={(e) => handleInputChange('budgetMax', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="preferredGender">Preferred Gender</label>
          <select
            id="preferredGender"
            value={localFilters.preferredGender || ''}
            onChange={(e) => handleInputChange('preferredGender', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Any</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="userOccupation">Preferred Occupation</label>
          <select
            id="userOccupation"
            value={localFilters.userOccupation || ''}
            onChange={(e) => handleInputChange('userOccupation', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="student">Student</option>
            <option value="employed">Employed</option>
            <option value="any">Any</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="smokingStatus">Smoking Preference</label>
          <select
            id="smokingStatus"
            value={localFilters.smokingStatus || ''}
            onChange={(e) => handleInputChange('smokingStatus', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="smoker">Smoker</option>
            <option value="non-smoker">Non-smoker</option>
            <option value="any">Any</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="petStatus">Pet Preference</label>
          <select
            id="petStatus"
            value={localFilters.petStatus || ''}
            onChange={(e) => handleInputChange('petStatus', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="pet-friendly">Pet-friendly</option>
            <option value="no-pets">No pets</option>
            <option value="any">Any</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="cleanlinessAttitude">Cleanliness Level</label>
          <select
            id="cleanlinessAttitude"
            value={localFilters.cleanlinessAttitude || ''}
            onChange={(e) => handleInputChange('cleanlinessAttitude', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="very-clean">Very Clean</option>
            <option value="moderate">Moderate</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="noiseAttitude">Noise Level</label>
          <select
            id="noiseAttitude"
            value={localFilters.noiseAttitude || ''}
            onChange={(e) => handleInputChange('noiseAttitude', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="quiet">Quiet</option>
            <option value="moderate">Moderate</option>
            <option value="social">Social</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="studyHabits">Study Habits</label>
          <select
            id="studyHabits"
            value={localFilters.studyHabits || ''}
            onChange={(e) => handleInputChange('studyHabits', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="quiet-study">Quiet Study</option>
            <option value="moderate-study">Moderate Study</option>
            <option value="social-study">Social Study</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="socialAttitude">Social Preference</label>
          <select
            id="socialAttitude"
            value={localFilters.socialAttitude || ''}
            onChange={(e) => handleInputChange('socialAttitude', e.target.value || undefined)}
          >
            <option value="">Any</option>
            <option value="introvert">Introvert</option>
            <option value="ambivert">Ambivert</option>
            <option value="extrovert">Extrovert</option>
          </select>
        </div>

        <div className="filter-actions">
          <button type="submit" className="search-button">
            Search
          </button>
          <button type="button" onClick={handleClear} className="clear-button">
            Clear All
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters; 