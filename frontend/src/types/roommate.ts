// Roommate Announcement Types
export interface RoommateAnnouncement {
  announcementId: number;
  userId: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  leaseDuration: number;
  preferredGender: "male" | "female" | "any";
  userOccupation: "student" | "employed" | "any";
  userAgeMin: number;
  userAgeMax: number;
  smokingStatus: "smoker" | "non-smoker" | "any";
  petStatus: "pet-friendly" | "no-pets" | "any";
  cleanlinessAttitude: "very-clean" | "moderate" | "relaxed";
  noiseAttitude: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialAttitude: "introvert" | "ambivert" | "extrovert";
  locationAreas: string[];
  mustHaveAmenities: string[];
  dealBreakers: string[];
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    userFirstName: string;
    userLastName: string;
    profilePicture?: string;
    bio?: string;
  };
  compatibilityScore?: number;
  photos?: { photoId: number; url: string; order?: number }[];
}

export interface CreateRoommateAnnouncementData {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  leaseDuration: number;
  preferredGender: "male" | "female" | "any";
  userOccupation: "student" | "employed" | "any";
  userAgeMin: number;
  userAgeMax: number;
  smokingStatus: "smoker" | "non-smoker" | "any";
  petStatus: "pet-friendly" | "no-pets" | "any";
  cleanlinessAttitude: "very-clean" | "moderate" | "relaxed";
  noiseAttitude: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialAttitude: "introvert" | "ambivert" | "extrovert";
  locationAreas: string[];
  mustHaveAmenities: string[];
  dealBreakers: string[];
}

// User Profile Types
export interface UserProfile {
  profileId: number;
  userId: number;
  age: number;
  smokingStatus: "smoker" | "non-smoker";
  hasPets: boolean;
  petDetails?: string;
  cleanlinessLevel: "very-clean" | "moderate" | "relaxed";
  noiseLevel: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialPreference: "introvert" | "ambivert" | "extrovert";
  sleepSchedule: "early-bird" | "night-owl" | "flexible";
  cookingHabits: "cooks-regularly" | "occasional-cooking" | "rarely-cooks";
  guestPolicy: "frequent-guests" | "occasional-guests" | "rare-guests";
  budgetRange: {
    min: number;
    max: number;
  };
  preferredAreas: string[];
  mustHaveAmenities: string[];
  dealBreakers: string[];
  additionalInfo?: string;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    userFirstName: string;
    userLastName: string;
    profilePicture?: string;
    bio?: string;
  };
}

export interface CreateUserProfileData {
  age: number;
  smokingStatus: "smoker" | "non-smoker";
  hasPets: boolean;
  petDetails?: string;
  cleanlinessLevel: "very-clean" | "moderate" | "relaxed";
  noiseLevel: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialPreference: "introvert" | "ambivert" | "extrovert";
  sleepSchedule: "early-bird" | "night-owl" | "flexible";
  cookingHabits: "cooks-regularly" | "occasional-cooking" | "rarely-cooks";
  guestPolicy: "frequent-guests" | "occasional-guests" | "rare-guests";
  budgetRange: {
    min: number;
    max: number;
  };
  preferredAreas: string[];
  mustHaveAmenities: string[];
  dealBreakers: string[];
  additionalInfo?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form Step Props
export interface StepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
  displayedStep?: number;
}

// Filter Types
export interface AnnouncementFilters {
  search?: string;
  preferredGender?: "male" | "female" | "any";
  userOccupation?: "student" | "employed" | "any";
  smokingStatus?: "smoker" | "non-smoker" | "any";
  petStatus?: "pet-friendly" | "no-pets" | "any";
  cleanlinessAttitude?: "very-clean" | "moderate" | "relaxed";
  noiseAttitude?: "quiet" | "moderate" | "social";
  studyHabits?: "quiet-study" | "moderate-study" | "social-study";
  socialAttitude?: "introvert" | "ambivert" | "extrovert";
  budgetMin?: number;
  budgetMax?: number;
  locationAreas?: string[];
}

// Ideal Roommate Preference Types
export interface IdealRoommatePreference {
  preferenceId: number;
  userId: number;
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGender: "male" | "female" | "non-binary" | "no-preference";
  arrangementTypes: string[];
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  preferredOccupationTypes: string[];
  preferredWorkSchedules: string[];
  smokingPreference: "yes" | "no" | "doesnt-matter";
  petPreference: "yes" | "no" | "depends";
  cleanlinessPreference: number;
  sociabilityPreference: "very-social" | "friendly-private" | "quiet-independent" | "no-preference";
  noiseLevelPreference: number;
  sleepSchedulePreference: "early-bird" | "night-owl" | "doesnt-matter";
  guestPreference: "yes" | "no" | "sometimes";
  preferredLanguages: string[];
  openToAnyBackground: boolean;
  culturalComments?: string;
  sharedInterests: string[];
  additionalRequirements?: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId: number;
    userFirstName: string;
    userLastName: string;
  };
}

export interface CreateIdealRoommatePreferenceData {
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGender: "male" | "female" | "non-binary" | "no-preference";
  arrangementTypes: string;
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string;
  preferredOccupationTypes: string;
  preferredWorkSchedules: string;
  smokingPreference: "yes" | "no" | "doesnt-matter";
  petPreference: "yes" | "no" | "depends";
  cleanlinessPreference: number;
  sociabilityPreference: "very-social" | "friendly-private" | "quiet-independent" | "no-preference";
  noiseLevelPreference: number;
  sleepSchedulePreference: "early-bird" | "night-owl" | "doesnt-matter";
  guestPreference: "yes" | "no" | "sometimes";
  preferredLanguages: string;
  openToAnyBackground: boolean;
  culturalComments?: string;
  sharedInterests: string;
  additionalRequirements?: string;
}

export interface PreferencesStatus {
  hasPreferences: boolean;
  isComplete: boolean;
} 