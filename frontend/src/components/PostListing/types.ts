// types.ts
export interface PostListingFormData {
  listingType: "room" | "entire_property" | "";
  propertyType: "apartment" | "house" | "";
  userType: "owner" | "tenant" | "";
  livesInProperty?: boolean;

  cityId: string;
  cityName: string;           // City name (will need to map to ID)
  streetName?: string;
  streetNo?: string;

  // Step 2
  size?: number;
  singleBedrooms?: number;
  doubleBedrooms?: number;
  femaleFlatmates?: number;
  maleFlatmates?: number;
  amenities?: string[];
  rules?: string[];

  // Step 3 (for rooms)
  roomSize?: number;
  hasBed?: "yes" | "no";
  bedType?: string;
  roomAmenities?: string[];

  // Step 4
  availableFrom?: string;
  availableTo?: string;
  openEnded?: boolean;
  rent?: number;
  deposit?: number;
  noDeposit?: boolean;

  // Step 5
  title?: string;
  description?: string;
  photos?: string[];
  listingId?: number;
  }
  
  export interface StepProps {
    formData: PostListingFormData;
    setFormData: React.Dispatch<React.SetStateAction<PostListingFormData>>;
    onNext?: () => void;
    onBack?: () => void;
    displayedStep?: number; 
  }
  
  