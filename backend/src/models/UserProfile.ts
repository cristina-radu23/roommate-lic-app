import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./User";

interface UserProfileAttributes {
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
  budgetRange: string; // JSON string of budget range
  preferredAreas: string; // JSON string of preferred areas
  mustHaveAmenities: string; // JSON string of required amenities
  dealBreakers: string; // JSON string of deal breakers
  additionalInfo?: string;
  isProfileComplete: boolean;
}

interface UserProfileCreationAttributes extends Optional<UserProfileAttributes, "profileId" | "isProfileComplete"> {}

class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public profileId!: number;
  public userId!: number;
  public age!: number;
  public smokingStatus!: "smoker" | "non-smoker";
  public hasPets!: boolean;
  public petDetails?: string;
  public cleanlinessLevel!: "very-clean" | "moderate" | "relaxed";
  public noiseLevel!: "quiet" | "moderate" | "social";
  public studyHabits!: "quiet-study" | "moderate-study" | "social-study";
  public socialPreference!: "introvert" | "ambivert" | "extrovert";
  public sleepSchedule!: "early-bird" | "night-owl" | "flexible";
  public cookingHabits!: "cooks-regularly" | "occasional-cooking" | "rarely-cooks";
  public guestPolicy!: "frequent-guests" | "occasional-guests" | "rare-guests";
  public budgetRange!: string;
  public preferredAreas!: string;
  public mustHaveAmenities!: string;
  public dealBreakers!: string;
  public additionalInfo?: string;
  public isProfileComplete!: boolean;
}

UserProfile.init(
  {
    profileId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    age: { type: DataTypes.INTEGER, allowNull: false },
    smokingStatus: {
      type: DataTypes.ENUM("smoker", "non-smoker"),
      allowNull: false,
    },
    hasPets: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    petDetails: { type: DataTypes.TEXT, allowNull: true },
    cleanlinessLevel: {
      type: DataTypes.ENUM("very-clean", "moderate", "relaxed"),
      defaultValue: "moderate",
    },
    noiseLevel: {
      type: DataTypes.ENUM("quiet", "moderate", "social"),
      defaultValue: "moderate",
    },
    studyHabits: {
      type: DataTypes.ENUM("quiet-study", "moderate-study", "social-study"),
      defaultValue: "moderate-study",
    },
    socialPreference: {
      type: DataTypes.ENUM("introvert", "ambivert", "extrovert"),
      defaultValue: "ambivert",
    },
    sleepSchedule: {
      type: DataTypes.ENUM("early-bird", "night-owl", "flexible"),
      defaultValue: "flexible",
    },
    cookingHabits: {
      type: DataTypes.ENUM("cooks-regularly", "occasional-cooking", "rarely-cooks"),
      defaultValue: "occasional-cooking",
    },
    guestPolicy: {
      type: DataTypes.ENUM("frequent-guests", "occasional-guests", "rare-guests"),
      defaultValue: "occasional-guests",
    },
    budgetRange: { type: DataTypes.TEXT, allowNull: false },
    preferredAreas: { type: DataTypes.TEXT, allowNull: false },
    mustHaveAmenities: { type: DataTypes.TEXT, allowNull: true },
    dealBreakers: { type: DataTypes.TEXT, allowNull: true },
    additionalInfo: { type: DataTypes.TEXT, allowNull: true },
    isProfileComplete: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: false 
    },
  },
  {
    sequelize,
    modelName: "UserProfile",
    tableName: "user_profiles",
    timestamps: true,
  }
);

// Define associations
UserProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(UserProfile, { foreignKey: "userId", as: "profile" });

export default UserProfile; 