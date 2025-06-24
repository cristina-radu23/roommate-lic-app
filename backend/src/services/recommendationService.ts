import { Op } from 'sequelize';
import Listing from '../models/Listing';
import Like from '../models/Like';
import User from '../models/User';
import RoomAmenity from '../models/RoomAmenity';
import PropertyAmenity from '../models/PropertyAmenity';
import HouseRule from '../models/HouseRule';
import Address from '../models/Address';
import City from '../models/City';

interface ListingFeatures {
  listingId: number;
  features: number[];
  featureNames: string[];
}

interface UserPreferences {
  userId: number;
  preferences: number[];
  likedListings: number[];
}

interface RecommendationScore {
  listingId: number;
  score: number;
  reasons: string[];
}

export class RecommendationService {
  private featureNames: string[] = [];
  private listingsCache: Map<number, ListingFeatures> = new Map();
  private userPreferencesCache: Map<number, UserPreferences> = new Map();
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId: number, limit: number = 20): Promise<RecommendationScore[]> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        const cachedRecommendations = this.getCachedRecommendations(userId, limit);
        if (cachedRecommendations.length > 0) {
          return cachedRecommendations;
        }
      }

      // Get user preferences
      const userPrefs = await this.getUserPreferences(userId);
      // Debug log: print userId and liked listings
      console.log(`[RECOMMENDATIONS] userId: ${userId}, likes count: ${userPrefs.likedListings.length}, likedListings:`, userPrefs.likedListings);
      // Log featureNames for consistency check
      console.log('[RECOMMENDATIONS] featureNames:', this.featureNames);
      // Log user feature vector
      console.log('[RECOMMENDATIONS] userPrefs.preferences:', userPrefs.preferences);
      
      // Check minimum likes requirement (recommend at least 3 likes for good recommendations)
      const MIN_LIKES_FOR_RECOMMENDATIONS = 3;
      if (userPrefs.likedListings.length < MIN_LIKES_FOR_RECOMMENDATIONS) {
        console.log(`User ${userId} has only ${userPrefs.likedListings.length} likes. Need at least ${MIN_LIKES_FOR_RECOMMENDATIONS} for good recommendations.`);
        return []; // Return empty array to show "need more likes" message
      }
      
      // Get all available listings (excluding user's own)
      const allListings = await this.getAllListingsFeatures(userId);
      
      if (allListings.length === 0) {
        return [];
      }

      // Log the first listing's feature vector for comparison
      console.log('[RECOMMENDATIONS] first listing features:', allListings[0].features);

      // Calculate recommendation scores
      const recommendations: RecommendationScore[] = [];
      
      for (const listing of allListings) {
        const score = this.calculateRecommendationScore(userPrefs, listing);
        if (score.score > 0) {
          recommendations.push(score);
        }
      }

      // Sort by score and return top results
      recommendations.sort((a, b) => b.score - a.score);
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate recommendation score using hybrid approach
   */
  private calculateRecommendationScore(
    userPrefs: UserPreferences, 
    listing: ListingFeatures
  ): RecommendationScore {
    const reasons: string[] = [];
    let totalScore = 0;

    // Content-based filtering (feature similarity)
    const contentScore = this.calculateContentScore(userPrefs, listing);
    totalScore += contentScore.score * 0.6; // 60% weight
    reasons.push(...contentScore.reasons);

    // Collaborative filtering (similar users)
    const collaborativeScore = this.calculateCollaborativeScore(userPrefs, listing);
    totalScore += collaborativeScore.score * 0.4; // 40% weight
    reasons.push(...collaborativeScore.reasons);

    return {
      listingId: listing.listingId,
      score: totalScore,
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    };
  }

  /**
   * Content-based filtering based on listing features
   */
  private calculateContentScore(
    userPrefs: UserPreferences, 
    listing: ListingFeatures
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Calculate cosine similarity between user preferences and listing features
    const similarity = this.cosineSimilarity(userPrefs.preferences, listing.features);
    score += similarity * 100;

    // Check specific feature matches (including city_)
    for (let i = 0; i < listing.features.length; i++) {
      const featureName = listing.featureNames[i];
      if (listing.features[i] > 0 && userPrefs.preferences[i] > 0.5) {
        reasons.push(`Matches your preference for ${featureName}`);
        score += 10;
      }
    }

    return { score, reasons };
  }

  /**
   * Collaborative filtering based on similar users
   */
  private calculateCollaborativeScore(
    userPrefs: UserPreferences, 
    listing: ListingFeatures
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Find users with similar preferences who liked this listing
    const similarUsers = this.findSimilarUsers(userPrefs);
    
    if (similarUsers.length > 0) {
      const avgSimilarity = similarUsers.reduce((sum, user) => sum + user.similarity, 0) / similarUsers.length;
      score += avgSimilarity * 50;
      reasons.push(`${similarUsers.length} users with similar preferences liked this listing`);
    }

    return { score, reasons };
  }

  /**
   * Get user preferences based on their likes
   */
  private async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Check cache first
    if (this.userPreferencesCache.has(userId)) {
      return this.userPreferencesCache.get(userId)!;
    }

    // Get user's liked listings
    const likes = await Like.findAll({
      where: { userId },
      include: [{
        model: Listing,
        include: [
          { model: RoomAmenity },
          { model: PropertyAmenity },
          { model: HouseRule }
        ]
      }]
    });

    const likedListings = likes.map(like => like.listingId);
    
    // Calculate average preferences from liked listings
    const preferences = new Array(this.featureNames.length).fill(0);
    let totalListings = 0;

    for (const like of likes) {
      // Access the associated Listing through the include
      const listing = (like as any).Listing;
      if (listing) {
        const listingFeatures = await this.getListingFeatures(listing);
        if (listingFeatures) {
          for (let i = 0; i < preferences.length; i++) {
            preferences[i] += listingFeatures.features[i] || 0;
          }
          totalListings++;
        }
      }
    }

    // Normalize preferences
    if (totalListings > 0) {
      for (let i = 0; i < preferences.length; i++) {
        preferences[i] /= totalListings;
      }
    }

    const userPrefs: UserPreferences = {
      userId,
      preferences,
      likedListings
    };

    // Cache the result
    this.userPreferencesCache.set(userId, userPrefs);
    
    return userPrefs;
  }

  /**
   * Get all listings with their features
   */
  private async getAllListingsFeatures(excludeUserId: number): Promise<ListingFeatures[]> {
    const listings = await Listing.findAll({
      where: { 
        userId: { [Op.ne]: excludeUserId } // Exclude user's own listings
      },
      include: [
        { model: RoomAmenity },
        { model: PropertyAmenity },
        { model: HouseRule },
        { model: Address, include: [{ model: City }] }
      ]
    });

    const features: ListingFeatures[] = [];
    
    for (const listing of listings) {
      const listingFeatures = await this.getListingFeatures(listing);
      if (listingFeatures) {
        features.push(listingFeatures);
      }
    }

    return features;
  }

  /**
   * Extract features from a listing
   */
  private async getListingFeatures(listing: any): Promise<ListingFeatures | null> {
    // Check cache first
    if (this.listingsCache.has(listing.listingId)) {
      return this.listingsCache.get(listing.listingId)!;
    }

    // Initialize feature names if not done
    if (this.featureNames.length === 0) {
      await this.initializeFeatureNames();
    }

    const features = new Array(this.featureNames.length).fill(0);
    
    // Basic features (userRole intentionally ignored)
    features[this.getFeatureIndex('listingType_room')] = listing.listingType === 'room' ? 1 : 0;
    features[this.getFeatureIndex('listingType_entire_property')] = listing.listingType === 'entire_property' ? 1 : 0;
    features[this.getFeatureIndex('propertyType_apartment')] = listing.propertyType === 'apartment' ? 1 : 0;
    features[this.getFeatureIndex('propertyType_house')] = listing.propertyType === 'house' ? 1 : 0;
    // userRole features are not set (ignored)
    // features[this.getFeatureIndex('userRole_owner')] = 0;
    // features[this.getFeatureIndex('userRole_tenant')] = 0;
    
    // Numeric features (normalized)
    features[this.getFeatureIndex('sizeM2')] = Math.min(listing.sizeM2 / 200, 1); // Normalize to 0-1
    features[this.getFeatureIndex('rent')] = Math.min(listing.rent / 2000, 1); // Normalize to 0-1
    features[this.getFeatureIndex('bedroomsSingle')] = Math.min(listing.bedroomsSingle / 5, 1);
    features[this.getFeatureIndex('bedroomsDouble')] = Math.min(listing.bedroomsDouble / 5, 1);
    features[this.getFeatureIndex('flatmatesFemale')] = Math.min(listing.flatmatesFemale / 10, 1);
    features[this.getFeatureIndex('flatmatesMale')] = Math.min(listing.flatmatesMale / 10, 1);
    
    // Boolean features
    features[this.getFeatureIndex('hasBed')] = listing.hasBed ? 1 : 0;
    features[this.getFeatureIndex('noDeposit')] = listing.noDeposit ? 1 : 0;
    features[this.getFeatureIndex('openEnded')] = listing.openEnded ? 1 : 0;
    
    // Bed type features
    if (listing.bedType) {
      features[this.getFeatureIndex(`bedType_${listing.bedType}`)] = 1;
    }
    
    // Room size (if applicable)
    if (listing.roomSizeM2) {
      features[this.getFeatureIndex('roomSizeM2')] = Math.min(listing.roomSizeM2 / 50, 1);
    }
    
    // Amenities
    if (listing.RoomAmenities) {
      for (const amenity of listing.RoomAmenities) {
        features[this.getFeatureIndex(`roomAmenity_${amenity.name}`)] = 1;
      }
    }
    
    if (listing.PropertyAmenities) {
      for (const amenity of listing.PropertyAmenities) {
        features[this.getFeatureIndex(`propertyAmenity_${amenity.name}`)] = 1;
      }
    }
    
    if (listing.HouseRules) {
      for (const rule of listing.HouseRules) {
        features[this.getFeatureIndex(`houseRule_${rule.name}`)] = 1;
      }
    }

    // City feature (one-hot)
    let cityName = undefined;
    if (listing.Address && listing.Address.City && listing.Address.City.cityName) {
      cityName = listing.Address.City.cityName;
      features[this.getFeatureIndex(`city_${cityName}`)] = 1;
    }

    const listingFeatures: ListingFeatures = {
      listingId: listing.listingId,
      features,
      featureNames: [...this.featureNames]
    };

    // Cache the result
    this.listingsCache.set(listing.listingId, listingFeatures);
    
    return listingFeatures;
  }

  /**
   * Initialize feature names from database
   */
  private async initializeFeatureNames(): Promise<void> {
    const featureNames: string[] = [
      // Basic features
      'listingType_room', 'listingType_entire_property',
      'propertyType_apartment', 'propertyType_house',
      // userRole intentionally omitted
      // 'userRole_owner', 'userRole_tenant',
      
      // Numeric features
      'sizeM2', 'rent', 'bedroomsSingle', 'bedroomsDouble',
      'flatmatesFemale', 'flatmatesMale', 'roomSizeM2',
      
      // Boolean features
      'hasBed', 'noDeposit', 'openEnded',
      
      // Bed types
      'bedType_single', 'bedType_double', 'bedType_sofa_bed'
    ];

    // Add room amenities
    const roomAmenities = await RoomAmenity.findAll();
    for (const amenity of roomAmenities) {
      featureNames.push(`roomAmenity_${amenity.name}`);
    }

    // Add property amenities
    const propertyAmenities = await PropertyAmenity.findAll();
    for (const amenity of propertyAmenities) {
      featureNames.push(`propertyAmenity_${amenity.name}`);
    }

    // Add house rules
    const houseRules = await HouseRule.findAll();
    for (const rule of houseRules) {
      featureNames.push(`houseRule_${rule.name}`);
    }

    // Add city names as one-hot features
    const cities = await City.findAll();
    for (const city of cities) {
      featureNames.push(`city_${city.cityName}`);
    }

    this.featureNames = featureNames;
  }

  /**
   * Get feature index by name
   */
  private getFeatureIndex(featureName: string): number {
    const index = this.featureNames.indexOf(featureName);
    return index >= 0 ? index : 0;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find users with similar preferences
   */
  private findSimilarUsers(userPrefs: UserPreferences): Array<{ userId: number; similarity: number }> {
    const similarUsers: Array<{ userId: number; similarity: number }> = [];
    
    // This is a simplified version - in production, you'd want to cache user similarities
    // and update them periodically rather than calculating on every request
    
    for (const [cachedUserId, cachedPrefs] of this.userPreferencesCache) {
      if (cachedUserId !== userPrefs.userId) {
        const similarity = this.cosineSimilarity(userPrefs.preferences, cachedPrefs.preferences);
        if (similarity > 0.3) { // Only consider users with >30% similarity
          similarUsers.push({ userId: cachedUserId, similarity });
        }
      }
    }
    
    return similarUsers.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastUpdate < this.CACHE_DURATION;
  }

  /**
   * Get cached recommendations
   */
  private getCachedRecommendations(userId: number, limit: number): RecommendationScore[] {
    // This is a simplified cache implementation
    // In production, you'd want to use Redis or a proper caching solution
    return [];
  }

  /**
   * Clear cache (call when new likes are added)
   */
  clearCache(): void {
    this.listingsCache.clear();
    this.userPreferencesCache.clear();
    this.lastUpdate = Date.now();
  }

  /**
   * Update user preferences when they like/unlike a listing
   */
  async updateUserPreferences(userId: number): Promise<void> {
    this.userPreferencesCache.delete(userId);
    await this.getUserPreferences(userId); // Recalculate and cache
  }
} 