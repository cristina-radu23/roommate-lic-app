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
  preferredOccupation: "student" | "employed" | "any";
  preferredAgeMin: number;
  preferredAgeMax: number;
  smokingPreference: "smoker" | "non-smoker" | "any";
  petPreference: "pet-friendly" | "no-pets" | "any";
  cleanlinessLevel: "very-clean" | "moderate" | "relaxed";
  noiseLevel: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialPreference: "introvert" | "ambivert" | "extrovert";
  locationPreferences: string[];
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
  preferredOccupation: "student" | "employed" | "any";
  preferredAgeMin: number;
  preferredAgeMax: number;
  smokingPreference: "smoker" | "non-smoker" | "any";
  petPreference: "pet-friendly" | "no-pets" | "any";
  cleanlinessLevel: "very-clean" | "moderate" | "relaxed";
  noiseLevel: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialPreference: "introvert" | "ambivert" | "extrovert";
  locationPreferences: string[];
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
  preferredOccupation?: "student" | "employed" | "any";
  smokingPreference?: "smoker" | "non-smoker" | "any";
  petPreference?: "pet-friendly" | "no-pets" | "any";
  cleanlinessLevel?: "very-clean" | "moderate" | "relaxed";
  noiseLevel?: "quiet" | "moderate" | "social";
  studyHabits?: "quiet-study" | "moderate-study" | "social-study";
  socialPreference?: "introvert" | "ambivert" | "extrovert";
  budgetMin?: number;
  budgetMax?: number;
  preferredCities?: string[];
} 