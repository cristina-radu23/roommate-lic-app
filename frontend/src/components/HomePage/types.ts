// src/components/HomePage/types.ts

export interface FilterCriteria {
    city?: string;
    minRent?: number;
    maxRent?: number;
    rules?: string[];
    amenities?: string[];
    roomAmenities?: string[];
    listingType?: "room" | "entire_property";
    propertyType?: "apartment" | "house";
    preferredRoommate?: "female" | "male" | "any";
}
  