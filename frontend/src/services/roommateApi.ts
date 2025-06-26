import { 
  RoommateAnnouncement, 
  CreateRoommateAnnouncementData, 
  UserProfile, 
  CreateUserProfileData,
  ApiResponse,
  PaginatedResponse,
  AnnouncementFilters,
  IdealRoommatePreference,
  CreateIdealRoommatePreferenceData,
  PreferencesStatus
} from '../types/roommate';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Helper function to make public requests
const makePublicRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Roommate Announcement API
export const roommateAnnouncementApi = {
  // Get all announcements (public)
  getAnnouncements: async (page = 1, limit = 10, filters?: AnnouncementFilters): Promise<PaginatedResponse<RoommateAnnouncement>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }

    if (filters) {
      const filterParams = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      if (Object.keys(filterParams).length > 0) {
        params.append('filters', JSON.stringify(filterParams));
      }
    }

    return makePublicRequest(`${API_BASE_URL}/roommate-announcements?${params}`);
  },

  // Get announcement by ID (public)
  getAnnouncementById: async (id: number): Promise<ApiResponse<RoommateAnnouncement>> => {
    return makePublicRequest(`${API_BASE_URL}/roommate-announcements/${id}`);
  },

  // Create announcement (authenticated)
  createAnnouncement: async (data: CreateRoommateAnnouncementData & { photos?: string[] }): Promise<ApiResponse<RoommateAnnouncement>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/roommate-announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update announcement (authenticated)
  updateAnnouncement: async (id: number, data: Partial<CreateRoommateAnnouncementData>): Promise<ApiResponse<RoommateAnnouncement>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/roommate-announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete announcement (authenticated)
  deleteAnnouncement: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/roommate-announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user's announcements (authenticated)
  getUserAnnouncements: async (): Promise<ApiResponse<RoommateAnnouncement[]>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/roommate-announcements/user/me`);
  },

  // Get matching announcements (authenticated)
  getMatchingAnnouncements: async (page = 1, limit = 10): Promise<PaginatedResponse<RoommateAnnouncement>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return makeAuthenticatedRequest(`${API_BASE_URL}/roommate-announcements/matching/me?${params}`);
  },
};

// User Profile API
export const userProfileApi = {
  // Create user profile (authenticated)
  createUserProfile: async (data: CreateUserProfileData): Promise<ApiResponse<UserProfile>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/user-profiles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user profile (authenticated)
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/user-profiles/me`);
  },

  // Update user profile (authenticated)
  updateUserProfile: async (data: Partial<CreateUserProfileData>): Promise<ApiResponse<UserProfile>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/user-profiles/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user profile (authenticated)
  deleteUserProfile: async (): Promise<ApiResponse<{ message: string }>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/user-profiles/me`, {
      method: 'DELETE',
    });
  },

  // Check profile completion (authenticated)
  checkProfileCompletion: async (): Promise<ApiResponse<{ hasProfile: boolean; isComplete: boolean }>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/user-profiles/me/completion`);
  },
};

// Ideal Roommate Preferences API
export const idealRoommatePreferenceApi = {
  // Create or update ideal roommate preferences
  createOrUpdatePreferences: async (data: CreateIdealRoommatePreferenceData): Promise<ApiResponse<IdealRoommatePreference>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/ideal-roommate-preferences`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user's ideal roommate preferences
  getUserPreferences: async (): Promise<ApiResponse<IdealRoommatePreference>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/ideal-roommate-preferences/me`);
  },

  // Check preferences status
  checkPreferencesStatus: async (): Promise<ApiResponse<PreferencesStatus>> => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/ideal-roommate-preferences/status`);
  },

  // Get recommended roommate announcements
  getRecommendedAnnouncements: async (page = 1, limit = 10, filters?: AnnouncementFilters): Promise<PaginatedResponse<RoommateAnnouncement>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters) {
      const filterParams = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      if (Object.keys(filterParams).length > 0) {
        params.append('filters', JSON.stringify(filterParams));
      }
    }
    return makeAuthenticatedRequest(`${API_BASE_URL}/ideal-roommate-preferences/recommendations?${params}`);
  },
}; 