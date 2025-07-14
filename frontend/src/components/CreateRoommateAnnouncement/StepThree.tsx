import React from 'react';

interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

const StepThree: React.FC<StepProps> = ({ formData, setFormData, onNext, onBack }) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkScheduleChange = (schedule: string) => {
    setFormData((prev: any) => {
      const current = prev.workSchedule || [];
      const updated = current.includes(schedule)
        ? current.filter((s: string) => s !== schedule)
        : [...current, schedule];
      return { ...prev, workSchedule: updated };
    });
  };

  const canProceed = formData.occupation && formData.workSchedule.length > 0;

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Step 3: Lifestyle & Schedule</h2>
        <p>Tell us about your work and schedule</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="occupation">Occupation *</label>
          <select
            id="occupation"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="form-control"
            required
          >
            <option value="">Select occupation</option>
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="remote-worker">Remote worker</option>
            <option value="freelancer">Freelancer</option>
            <option value="other">Other</option>
          </select>
        </div>

        {formData.occupation === 'other' && (
          <div className="form-group">
            <label htmlFor="occupationOther">Please specify</label>
            <input
              type="text"
              id="occupationOther"
              value={formData.occupationOther || ''}
              onChange={(e) => handleInputChange('occupationOther', e.target.value)}
              placeholder="Your occupation"
              className="form-control"
            />
          </div>
        )}

        <div className="form-group">
          <label>Work Schedule *</label>
          <div className="checkbox-group">
            {[
              { value: '9-to-5', label: '9 to 5' },
              { value: 'night-shift', label: 'Night shift' },
              { value: 'varies', label: 'Varies' },
              { value: 'work-from-home', label: 'Work from home' },
              { value: 'mostly-out', label: 'Mostly out' }
            ].map((schedule) => (
              <label key={schedule.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.workSchedule?.includes(schedule.value) || false}
                  onChange={() => handleWorkScheduleChange(schedule.value)}
                />
                <span className="checkmark"></span>
                {schedule.label}
              </label>
            ))}
          </div>
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

export default StepThree; 