import React, { useState } from 'react';
import { AnnouncementFilters } from '../../types/roommate';

interface RoommateFilterPanelProps {
  initialFilters: AnnouncementFilters;
  onApply: (filters: AnnouncementFilters) => void;
  onClose: () => void;
}

const genderOptions = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
const occupationOptions = [
  { value: 'any', label: 'Any' },
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
];
const smokingOptions = [
  { value: 'any', label: 'Any' },
  { value: 'smoker', label: 'Smoker' },
  { value: 'non-smoker', label: 'Non-smoker' },
];
const petOptions = [
  { value: 'any', label: 'Any' },
  { value: 'pet-friendly', label: 'Pet-friendly' },
  { value: 'no-pets', label: 'No pets' },
];
const cleanlinessOptions = [
  { value: 'very-clean', label: 'Very Clean' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'relaxed', label: 'Relaxed' },
];
const noiseOptions = [
  { value: 'quiet', label: 'Quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'social', label: 'Social' },
];
const studyOptions = [
  { value: 'quiet-study', label: 'Quiet Study' },
  { value: 'moderate-study', label: 'Moderate Study' },
  { value: 'social-study', label: 'Social Study' },
];
const socialOptions = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'ambivert', label: 'Ambivert' },
  { value: 'extrovert', label: 'Extrovert' },
];

const RoommateFilterPanel: React.FC<RoommateFilterPanelProps> = ({ initialFilters, onApply, onClose }) => {
  const [filters, setFilters] = useState<AnnouncementFilters>(initialFilters);

  const handleChange = (field: keyof AnnouncementFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({});
  };

  return (
    <div className="card p-4 shadow" style={{ minWidth: 350, maxWidth: 500 }}>
      <h5 className="mb-3">Roommate Filters</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Search</label>
          <input type="text" className="form-control" placeholder="Search announcements..." value={filters.search || ''} onChange={e => handleChange('search', e.target.value)} />
        </div>
        <div className="mb-2">
          <label>Budget Range (€)</label>
          <div className="d-flex gap-2">
            <input type="number" className="form-control" placeholder="Min" value={filters.budgetMin || ''} onChange={e => handleChange('budgetMin', e.target.value ? Number(e.target.value) : undefined)} />
            <input type="number" className="form-control" placeholder="Max" value={filters.budgetMax || ''} onChange={e => handleChange('budgetMax', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
        <div className="mb-2">
          <label>Preferred Gender</label>
          <select className="form-select" value={filters.preferredGender || ''} onChange={e => handleChange('preferredGender', e.target.value || undefined)}>
            {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Preferred Occupation</label>
          <select className="form-select" value={filters.userOccupation || ''} onChange={e => handleChange('userOccupation', e.target.value || undefined)}>
            {occupationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Smoking Preference</label>
          <select className="form-select" value={filters.smokingStatus || ''} onChange={e => handleChange('smokingStatus', e.target.value || undefined)}>
            {smokingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Pet Preference</label>
          <select className="form-select" value={filters.petStatus || ''} onChange={e => handleChange('petStatus', e.target.value || undefined)}>
            {petOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Cleanliness Level</label>
          <select className="form-select" value={filters.cleanlinessAttitude || ''} onChange={e => handleChange('cleanlinessAttitude', e.target.value || undefined)}>
            <option value="">Any</option>
            {cleanlinessOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Noise Level</label>
          <select className="form-select" value={filters.noiseAttitude || ''} onChange={e => handleChange('noiseAttitude', e.target.value || undefined)}>
            <option value="">Any</option>
            {noiseOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Study Habits</label>
          <select className="form-select" value={filters.studyHabits || ''} onChange={e => handleChange('studyHabits', e.target.value || undefined)}>
            <option value="">Any</option>
            {studyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="mb-2">
          <label>Social Preference</label>
          <select className="form-select" value={filters.socialAttitude || ''} onChange={e => handleChange('socialAttitude', e.target.value || undefined)}>
            <option value="">Any</option>
            {socialOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-outline-danger" onClick={handleClear}>Clear</button>
          <button type="submit" className="btn btn-primary">Apply</button>
        </div>
      </form>
    </div>
  );
};

export default RoommateFilterPanel; 