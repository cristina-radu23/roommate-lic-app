import React, { useState } from 'react';
import { IdealRoommateFormData } from '../IdealRoommateForm';

interface StepSixProps {
  formData: IdealRoommateFormData;
  updateFormData: (updates: Partial<IdealRoommateFormData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
}

const StepSix: React.FC<StepSixProps> = ({ formData, updateFormData, onSubmit, onPrev, loading }) => {
  const [newInterest, setNewInterest] = useState('');

  const commonInterests = [
    'Cooking', 'Gaming', 'Fitness', 'Music', 'Reading', 'Travel', 'Photography',
    'Art', 'Movies', 'TV Shows', 'Sports', 'Dancing', 'Hiking', 'Cycling',
    'Swimming', 'Yoga', 'Meditation', 'Writing', 'Coding', 'Design', 'Fashion',
    'Beauty', 'Gardening', 'DIY', 'Crafts', 'Board Games', 'Puzzles', 'Chess',
    'Poker', 'Karaoke', 'Dancing', 'Singing', 'Playing Instruments', 'Painting',
    'Drawing', 'Sculpting', 'Pottery', 'Knitting', 'Crochet', 'Sewing', 'Baking',
    'Wine Tasting', 'Coffee', 'Tea', 'Cocktails', 'Beer', 'Wine', 'Cooking Shows',
    'Food Blogs', 'Restaurant Reviews', 'Food Photography', 'Vegan', 'Vegetarian',
    'Keto', 'Paleo', 'Gluten-free', 'Dairy-free', 'Organic', 'Local Food',
    'Farmers Markets', 'Food Trucks', 'Street Food', 'Fine Dining', 'Casual Dining',
    'Fast Food', 'Home Cooking', 'Meal Prep', 'Smoothies', 'Juicing', 'Detox',
    'Fasting', 'Intermittent Fasting', 'Keto', 'Paleo', 'Vegan', 'Vegetarian'
  ];

  const handleInterestAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      if (!formData.sharedInterests.includes(newInterest.trim())) {
        updateFormData({
          sharedInterests: [...formData.sharedInterests, newInterest.trim()]
        });
      }
      setNewInterest('');
    }
  };

  const handleInterestRemove = (interest: string) => {
    updateFormData({
      sharedInterests: formData.sharedInterests.filter(i => i !== interest)
    });
  };

  const handleInterestSelect = (interest: string) => {
    if (!formData.sharedInterests.includes(interest)) {
      updateFormData({
        sharedInterests: [...formData.sharedInterests, interest]
      });
    }
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="step-container">
      <h3 className="step-title">Interests & Final Details</h3>
      <p className="step-description">
        Tell us about shared interests and any additional requirements for your ideal roommate.
      </p>

      <div className="form-group">
        <label>Any shared interests you're looking for?</label>
        <div className="tag-input">
          {formData.sharedInterests.map((interest, index) => (
            <span key={index} className="tag">
              {interest}
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleInterestRemove(interest)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Type an interest and press Enter..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleInterestAdd}
          />
        </div>
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          Add interests you'd like to share with your roommate
        </small>
        
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '8px', display: 'block' }}>
            Popular interests:
          </label>
          <div className="checkbox-group" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {commonInterests.map((interest) => (
              <label
                key={interest}
                className={`checkbox-item ${formData.sharedInterests.includes(interest) ? 'selected' : ''}`}
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                onClick={() => handleInterestSelect(interest)}
              >
                <input
                  type="checkbox"
                  checked={formData.sharedInterests.includes(interest)}
                  readOnly
                />
                {interest}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>What else matters to you in a roommate?</label>
        <textarea
          placeholder="Tell us about any other preferences, deal-breakers, or important factors that matter to you when choosing a roommate..."
          value={formData.additionalRequirements || ''}
          onChange={(e) => updateFormData({ additionalRequirements: e.target.value })}
          rows={6}
        />
        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
          This is optional but helps us find the best possible match for you
        </small>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onPrev} disabled={loading}>
          Previous
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid #ecf0f1', 
            borderTop: '2px solid #667eea', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>Saving your preferences...</p>
        </div>
      )}
    </div>
  );
};

export default StepSix; 