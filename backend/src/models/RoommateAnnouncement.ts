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
  userOccupation: "student" | "employed" | "any";
  userAgeMin: number;
  userAgeMax: number;
  smokingStatus: "smoker" | "non-smoker" | "any";
  petStatus: "pet-friendly" | "no-pets" | "any";
  cleanlinessAttitude: "very-clean" | "moderate" | "relaxed";
  noiseAttitude: "quiet" | "moderate" | "social";
  studyHabits: "quiet-study" | "moderate-study" | "social-study";
  socialAttitude: "introvert" | "ambivert" | "extrovert";
  locationAreas: string; // JSON string of preferred areas
  mustHaveAmenities: string; // JSON string of required amenities
  dealBreakers: string; // JSON string of deal breakers
  isActive: boolean;
  expiresAt: Date;
  fullName: string;
  age: number;
  gender: string;
  preferredGenderArr: string; // JSON array
  lookingFor: string;
  preferredLocations: string; // JSON array
  occupation: string;
  occupationOther: string;
  workSchedule: string; // JSON array
  smoking: string;
  drinking: string;
  hasPets: string;
  petType: string;
  okayWithPets: string;
  cleanlinessLevelNum: number;
  socialPreferenceRaw: string;
  noiseLevelRaw: string;
  sleepSchedule: string;
  visitorsOften: string;
  languages: string; // JSON array
  culturalBackground: string;
  hobbies: string; // JSON array
  bio: string;
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
  public userOccupation!: "student" | "employed" | "any";
  public userAgeMin!: number;
  public userAgeMax!: number;
  public smokingStatus!: "smoker" | "non-smoker" | "any";
  public petStatus!: "pet-friendly" | "no-pets" | "any";
  public cleanlinessAttitude!: "very-clean" | "moderate" | "relaxed";
  public noiseAttitude!: "quiet" | "moderate" | "social";
  public studyHabits!: "quiet-study" | "moderate-study" | "social-study";
  public socialAttitude!: "introvert" | "ambivert" | "extrovert";
  public locationAreas!: string;
  public mustHaveAmenities!: string;
  public dealBreakers!: string;
  public isActive!: boolean;
  public expiresAt!: Date;
  public fullName!: string;
  public age!: number;
  public gender!: string;
  public preferredGenderArr!: string; // JSON array
  public lookingFor!: string;
  public preferredLocations!: string; // JSON array
  public occupation!: string;
  public occupationOther!: string;
  public workSchedule!: string; // JSON array
  public smoking!: string;
  public drinking!: string;
  public hasPets!: string;
  public petType!: string;
  public okayWithPets!: string;
  public cleanlinessLevelNum!: number;
  public socialPreferenceRaw!: string;
  public noiseLevelRaw!: string;
  public sleepSchedule!: string;
  public visitorsOften!: string;
  public languages!: string; // JSON array
  public culturalBackground!: string;
  public hobbies!: string; // JSON array
  public bio!: string;
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
    userOccupation: {
      type: DataTypes.ENUM("student", "employed", "any"),
      defaultValue: "any",
    },
    userAgeMin: { type: DataTypes.INTEGER, allowNull: false },
    userAgeMax: { type: DataTypes.INTEGER, allowNull: false },
    smokingStatus: {
      type: DataTypes.ENUM("smoker", "non-smoker", "any"),
      defaultValue: "any",
    },
    petStatus: {
      type: DataTypes.ENUM("pet-friendly", "no-pets", "any"),
      defaultValue: "any",
    },
    cleanlinessAttitude: {
      type: DataTypes.ENUM("very-clean", "moderate", "relaxed"),
      defaultValue: "moderate",
    },
    noiseAttitude: {
      type: DataTypes.ENUM("quiet", "moderate", "social"),
      defaultValue: "moderate",
    },
    studyHabits: {
      type: DataTypes.ENUM("quiet-study", "moderate-study", "social-study"),
      defaultValue: "moderate-study",
    },
    socialAttitude: {
      type: DataTypes.ENUM("introvert", "ambivert", "extrovert"),
      defaultValue: "ambivert",
    },
    locationAreas: { type: DataTypes.TEXT, allowNull: true },
    mustHaveAmenities: { type: DataTypes.TEXT, allowNull: true },
    dealBreakers: { type: DataTypes.TEXT, allowNull: true },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: true 
    },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    preferredGenderArr: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    lookingFor: { type: DataTypes.STRING, allowNull: true },
    preferredLocations: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    occupation: { type: DataTypes.STRING, allowNull: true },
    occupationOther: { type: DataTypes.STRING, allowNull: true },
    workSchedule: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    smoking: { type: DataTypes.STRING, allowNull: true },
    drinking: { type: DataTypes.STRING, allowNull: true },
    hasPets: { type: DataTypes.STRING, allowNull: true },
    petType: { type: DataTypes.STRING, allowNull: true },
    okayWithPets: { type: DataTypes.STRING, allowNull: true },
    cleanlinessLevelNum: { type: DataTypes.INTEGER, allowNull: true },
    socialPreferenceRaw: { type: DataTypes.STRING, allowNull: true },
    noiseLevelRaw: { type: DataTypes.STRING, allowNull: true },
    sleepSchedule: { type: DataTypes.STRING, allowNull: true },
    visitorsOften: { type: DataTypes.STRING, allowNull: true },
    languages: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    culturalBackground: { type: DataTypes.STRING, allowNull: true },
    hobbies: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    bio: { type: DataTypes.TEXT, allowNull: true },
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