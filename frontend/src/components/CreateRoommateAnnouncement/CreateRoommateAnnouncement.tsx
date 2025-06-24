import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roommateAnnouncementApi } from '../../services/roommateApi';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import StepFive from './StepFive';
import StepSix from './StepSix';
import StepSeven from './StepSeven';
import StepEight from './StepEight';
import './CreateRoommateAnnouncement.css';

interface AnnouncementFormData {
  // Step 1: Basic Info
  fullName?: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  preferredGender: string[];

  // Step 2: Living Situation
  lookingFor: 'room-shared' | 'find-together' | 'take-over-lease';
  moveInDate: string;
  budget: number;
  preferredLocations: string[];

  // Step 3: Lifestyle & Schedule
  occupation: 'student' | 'professional' | 'remote-worker' | 'freelancer' | 'other';
  occupationOther?: string;
  workSchedule: string[];

  // Step 4: Personality & Habits
  smoking: 'yes' | 'no';
  drinking: 'yes' | 'no' | 'occasionally';
  hasPets: 'yes' | 'no';
  petType?: string;
  okayWithPets: 'yes' | 'no' | 'depends';

  // Step 5: Cleanliness & Lifestyle Preferences
  cleanlinessLevel: number; // 1-5
  socialPreference: 'very-social' | 'moderate' | 'private';
  noiseLevel: 'very-quiet' | 'moderate' | 'noisy';
  sleepSchedule: 'early-bird' | 'night-owl' | 'depends';
  visitorsOften: 'yes' | 'no' | 'sometimes';

  // Step 6: Language & Culture
  languages: string[];
  culturalBackground?: string;

  // Step 7: Hobbies & Interests
  hobbies: string[];
  bio: string;

  // Step 8: Profile Picture
  profilePicture?: File;
}

const CreateRoommateAnnouncement: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    age: 18,
    gender: 'prefer-not-to-say',
    preferredGender: [],
    lookingFor: 'room-shared',
    moveInDate: '',
    budget: 0,
    preferredLocations: [],
    occupation: 'student',
    workSchedule: [],
    smoking: 'no',
    drinking: 'no',
    hasPets: 'no',
    okayWithPets: 'depends',
    cleanlinessLevel: 3,
    socialPreference: 'moderate',
    noiseLevel: 'moderate',
    sleepSchedule: 'depends',
    visitorsOften: 'sometimes',
    languages: [],
    hobbies: [],
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Transform form data to match API format
      const announcementData = {
        title: `${formData.fullName || 'Someone'} looking for roommate`,
        description: formData.bio,
        budgetMin: Math.floor(formData.budget * 0.8),
        budgetMax: Math.ceil(formData.budget * 1.2),
        moveInDate: formData.moveInDate,
        leaseDuration: 12, // Default to 12 months
        preferredGender: formData.preferredGender.length > 0 ? 
          (formData.preferredGender[0] === 'male' ? 'male' : 
           formData.preferredGender[0] === 'female' ? 'female' : 'any') as 'male' | 'female' | 'any' : 'any',
        userOccupation: formData.occupation === 'student' ? 'student' as 'student' : 'employed' as 'employed',
        userAgeMin: Math.max(18, formData.age - 5),
        userAgeMax: formData.age + 5,
        smokingStatus: (formData.smoking === 'yes' ? 'smoker' : 'non-smoker') as 'smoker' | 'non-smoker' | 'any',
        petStatus: (formData.okayWithPets === 'yes' ? 'pet-friendly' : 'no-pets') as 'pet-friendly' | 'no-pets' | 'any',
        cleanlinessAttitude: (formData.cleanlinessLevel <= 2 ? 'relaxed' : 
                         formData.cleanlinessLevel >= 4 ? 'very-clean' : 'moderate') as 'very-clean' | 'moderate' | 'relaxed',
        noiseAttitude: (formData.noiseLevel === 'very-quiet' ? 'quiet' : 
                   formData.noiseLevel === 'noisy' ? 'social' : 'moderate') as 'quiet' | 'moderate' | 'social',
        studyHabits: (formData.workSchedule.includes('work-from-home') ? 'quiet-study' : 'moderate-study') as 'quiet-study' | 'moderate-study' | 'social-study',
        socialAttitude: (formData.socialPreference === 'very-social' ? 'extrovert' : 
                         formData.socialPreference === 'private' ? 'introvert' : 'ambivert') as 'introvert' | 'ambivert' | 'extrovert',
        locationAreas: formData.preferredLocations,
        mustHaveAmenities: [],
        dealBreakers: [],
        fullName: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        preferredGenderArr: formData.preferredGender,
        lookingFor: formData.lookingFor,
        preferredLocations: formData.preferredLocations,
        occupation: formData.occupation,
        occupationOther: formData.occupationOther,
        workSchedule: formData.workSchedule,
        smoking: formData.smoking,
        drinking: formData.drinking,
        hasPets: formData.hasPets,
        petType: formData.petType,
        okayWithPets: formData.okayWithPets,
        cleanlinessLevelNum: formData.cleanlinessLevel,
        socialPreferenceRaw: formData.socialPreference,
        noiseLevelRaw: formData.noiseLevel,
        sleepSchedule: formData.sleepSchedule,
        visitorsOften: formData.visitorsOften,
        languages: formData.languages,
        culturalBackground: formData.culturalBackground,
        hobbies: formData.hobbies,
        bio: formData.bio,
      };

      // Handle photo upload if a profile picture is selected
      let photos: string[] = [];
      if (formData.profilePicture) {
        const uploadData = new FormData();
        uploadData.append('photo', formData.profilePicture);
        const uploadRes = await fetch('http://localhost:5000/api/listings/upload-photo', {
          method: 'POST',
          body: uploadData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          photos.push(url);
        }
      }

      await roommateAnnouncementApi.createAnnouncement({ ...announcementData, photos });

      // Navigate to success page
      navigate('/announcement-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      setFormData,
      onNext: handleNext,
      onBack: handleBack,
      displayedStep: currentStep,
    };

    switch (currentStep) {
      case 1:
        return <StepOne {...stepProps} />;
      case 2:
        return <StepTwo {...stepProps} />;
      case 3:
        return <StepThree {...stepProps} />;
      case 4:
        return <StepFour {...stepProps} />;
      case 5:
        return <StepFive {...stepProps} />;
      case 6:
        return <StepSix {...stepProps} />;
      case 7:
        return <StepSeven {...stepProps} />;
      case 8:
        return <StepEight {...stepProps} onSubmit={handleSubmit} loading={loading} />;
      default:
        return <StepOne {...stepProps} />;
    }
  };

  return (
    <div className="create-roommate-announcement">
      <div className="container">
        <div className="form-header">
          <h1>Create Roommate Announcement</h1>
          <p>Tell potential roommates about yourself and what you're looking for</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 8) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">Step {currentStep} of 8</span>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="form-container">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default CreateRoommateAnnouncement; 