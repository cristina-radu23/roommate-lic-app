import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./User";

interface RoommateAnnouncementAttributes {
  announcementId: number;
  userId: number;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: Date;
  leaseDuration: number; // in months
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
  locationPreferences: string; // JSON string of preferred areas
  mustHaveAmenities: string; // JSON string of required amenities
  dealBreakers: string; // JSON string of deal breakers
  isActive: boolean;
  expiresAt: Date;
}

interface RoommateAnnouncementCreationAttributes extends Optional<RoommateAnnouncementAttributes, "announcementId" | "isActive"> {}

class RoommateAnnouncement extends Model<RoommateAnnouncementAttributes, RoommateAnnouncementCreationAttributes> implements RoommateAnnouncementAttributes {
  public announcementId!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public budgetMin!: number;
  public budgetMax!: number;
  public moveInDate!: Date;
  public leaseDuration!: number;
  public preferredGender!: "male" | "female" | "any";
  public preferredOccupation!: "student" | "employed" | "any";
  public preferredAgeMin!: number;
  public preferredAgeMax!: number;
  public smokingPreference!: "smoker" | "non-smoker" | "any";
  public petPreference!: "pet-friendly" | "no-pets" | "any";
  public cleanlinessLevel!: "very-clean" | "moderate" | "relaxed";
  public noiseLevel!: "quiet" | "moderate" | "social";
  public studyHabits!: "quiet-study" | "moderate-study" | "social-study";
  public socialPreference!: "introvert" | "ambivert" | "extrovert";
  public locationPreferences!: string;
  public mustHaveAmenities!: string;
  public dealBreakers!: string;
  public isActive!: boolean;
  public expiresAt!: Date;
}

RoommateAnnouncement.init(
  {
    announcementId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    budgetMin: { type: DataTypes.INTEGER, allowNull: false },
    budgetMax: { type: DataTypes.INTEGER, allowNull: false },
    moveInDate: { type: DataTypes.DATE, allowNull: false },
    leaseDuration: { type: DataTypes.INTEGER, allowNull: false },
    preferredGender: {
      type: DataTypes.ENUM("male", "female", "any"),
      defaultValue: "any",
    },
    preferredOccupation: {
      type: DataTypes.ENUM("student", "employed", "any"),
      defaultValue: "any",
    },
    preferredAgeMin: { type: DataTypes.INTEGER, allowNull: false },
    preferredAgeMax: { type: DataTypes.INTEGER, allowNull: false },
    smokingPreference: {
      type: DataTypes.ENUM("smoker", "non-smoker", "any"),
      defaultValue: "any",
    },
    petPreference: {
      type: DataTypes.ENUM("pet-friendly", "no-pets", "any"),
      defaultValue: "any",
    },
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
    locationPreferences: { type: DataTypes.TEXT, allowNull: true },
    mustHaveAmenities: { type: DataTypes.TEXT, allowNull: true },
    dealBreakers: { type: DataTypes.TEXT, allowNull: true },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: true 
    },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: "RoommateAnnouncement",
    tableName: "roommate_announcements",
    timestamps: true,
  }
);

// Define associations
RoommateAnnouncement.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RoommateAnnouncement, { foreignKey: "userId", as: "announcements" });

export default RoommateAnnouncement; 