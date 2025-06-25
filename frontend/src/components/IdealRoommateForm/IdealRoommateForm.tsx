import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { idealRoommatePreferenceApi } from '../../services/roommateApi';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import StepFive from './steps/StepFive';
import StepSix from './steps/StepSix';
import './IdealRoommateForm.css';

export interface IdealRoommateFormData {
  // Basic Preferences
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGender: "male" | "female" | "non-binary" | "no-preference";
  
  // Living Preferences
  arrangementTypes: string[];
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  
  // Lifestyle Compatibility
  preferredOccupationTypes: string[];
  preferredWorkSchedules: string[];
  smokingPreference: "yes" | "no" | "doesnt-matter";
  petPreference: "yes" | "no" | "depends";
  
  // Cleanliness & Personality
  cleanlinessPreference: number;
  sociabilityPreference: "very-social" | "friendly-private" | "quiet-independent" | "no-preference";
  noiseLevelPreference: number;
  sleepSchedulePreference: "early-bird" | "night-owl" | "doesnt-matter";
  guestPreference: "yes" | "no" | "sometimes";
  
  // Language & Cultural Preferences
  preferredLanguages: string[];
  openToAnyBackground: boolean;
  culturalComments?: string;
  
  // Interests
  sharedInterests: string[];
  additionalRequirements?: string;
}

const initialFormData: IdealRoommateFormData = {
  preferredAgeMin: 18,
  preferredAgeMax: 35,
  preferredGender: "no-preference",
  arrangementTypes: [],
  moveInDate: "",
  budgetMin: 300,
  budgetMax: 800,
  preferredLocations: [],
  preferredOccupationTypes: [],
  preferredWorkSchedules: [],
  smokingPreference: "doesnt-matter",
  petPreference: "depends",
  cleanlinessPreference: 3,
  sociabilityPreference: "no-preference",
  noiseLevelPreference: 3,
  sleepSchedulePreference: "doesnt-matter",
  guestPreference: "sometimes",
  preferredLanguages: [],
  openToAnyBackground: true,
  culturalComments: "",
  sharedInterests: [],
  additionalRequirements: "",
};

const IdealRoommateForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IdealRoommateFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const updateFormData = (updates: Partial<IdealRoommateFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert arrays to JSON strings for backend
      const submitData = {
        preferredAgeMin: formData.preferredAgeMin,
        preferredAgeMax: formData.preferredAgeMax,
        preferredGender: formData.preferredGender,
        arrangementTypes: JSON.stringify(formData.arrangementTypes),
        moveInDate: formData.moveInDate,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        preferredLocations: JSON.stringify(formData.preferredLocations),
        preferredOccupationTypes: JSON.stringify(formData.preferredOccupationTypes),
        preferredWorkSchedules: JSON.stringify(formData.preferredWorkSchedules),
        smokingPreference: formData.smokingPreference,
        petPreference: formData.petPreference,
        cleanlinessPreference: formData.cleanlinessPreference,
        sociabilityPreference: formData.sociabilityPreference,
        noiseLevelPreference: formData.noiseLevelPreference,
        sleepSchedulePreference: formData.sleepSchedulePreference,
        guestPreference: formData.guestPreference,
        preferredLanguages: JSON.stringify(formData.preferredLanguages),
        openToAnyBackground: formData.openToAnyBackground,
        culturalComments: formData.culturalComments,
        sharedInterests: JSON.stringify(formData.sharedInterests),
        additionalRequirements: formData.additionalRequirements,
      };

      await idealRoommatePreferenceApi.createOrUpdatePreferences(submitData);
      
      // Navigate to homepage so user can access "Roommates" -> "Recommended for you"
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <StepTwo
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StepThree
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <StepFour
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <StepFive
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <StepSix
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ maxWidth: 600, margin: '0 auto', paddingTop: 56 }}>
        <div className="card shadow-sm p-4">
          <h2 className="mb-3">Please log in to continue</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container form-container">
      <div className="form-content card shadow-sm">
        <div className="mb-4">
          <h2 className="mb-1 step-title">Ideal Roommate Profile</h2>
          <div className="text-muted mb-2" style={{ fontSize: '1rem' }}>Help us find your perfect roommate match</div>
          <div className="mb-2" style={{ fontSize: '0.95rem', color: '#888' }}>Step {currentStep} of 6</div>
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default IdealRoommateForm; 