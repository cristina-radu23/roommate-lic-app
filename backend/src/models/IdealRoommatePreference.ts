import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./User";

interface IdealRoommatePreferenceAttributes {
  preferenceId: number;
  userId: number;
  
  // Basic Preferences
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredGender: "male" | "female" | "non-binary" | "no-preference";
  
  // Living Preferences
  arrangementTypes: string; // JSON array: ["join-current", "find-together", "join-other"]
  moveInDate: Date;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string; // JSON array
  
  // Lifestyle Compatibility
  preferredOccupationTypes: string; // JSON array: ["student", "professional", "remote-worker", "freelancer", "no-preference"]
  preferredWorkSchedules: string; // JSON array: ["9-to-5", "night-shift", "remote", "flexible", "no-preference"]
  smokingPreference: "yes" | "no" | "doesnt-matter";
  petPreference: "yes" | "no" | "depends";
  
  // Cleanliness & Personality
  cleanlinessPreference: number; // 1-5 scale
  sociabilityPreference: "very-social" | "friendly-private" | "quiet-independent" | "no-preference";
  noiseLevelPreference: number; // 1-5 scale
  sleepSchedulePreference: "early-bird" | "night-owl" | "doesnt-matter";
  guestPreference: "yes" | "no" | "sometimes";
  
  // Language & Cultural Preferences
  preferredLanguages: string; // JSON array
  openToAnyBackground: boolean;
  culturalComments?: string;
  
  // Interests
  sharedInterests: string; // JSON array
  additionalRequirements?: string;
  
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IdealRoommatePreferenceCreationAttributes extends Optional<IdealRoommatePreferenceAttributes, "preferenceId" | "isComplete" | "createdAt" | "updatedAt"> {}

class IdealRoommatePreference extends Model<IdealRoommatePreferenceAttributes, IdealRoommatePreferenceCreationAttributes> implements IdealRoommatePreferenceAttributes {
  public preferenceId!: number;
  public userId!: number;
  public preferredAgeMin!: number;
  public preferredAgeMax!: number;
  public preferredGender!: "male" | "female" | "non-binary" | "no-preference";
  public arrangementTypes!: string;
  public moveInDate!: Date;
  public budgetMin!: number;
  public budgetMax!: number;
  public preferredLocations!: string;
  public preferredOccupationTypes!: string;
  public preferredWorkSchedules!: string;
  public smokingPreference!: "yes" | "no" | "doesnt-matter";
  public petPreference!: "yes" | "no" | "depends";
  public cleanlinessPreference!: number;
  public sociabilityPreference!: "very-social" | "friendly-private" | "quiet-independent" | "no-preference";
  public noiseLevelPreference!: number;
  public sleepSchedulePreference!: "early-bird" | "night-owl" | "doesnt-matter";
  public guestPreference!: "yes" | "no" | "sometimes";
  public preferredLanguages!: string;
  public openToAnyBackground!: boolean;
  public culturalComments?: string;
  public sharedInterests!: string;
  public additionalRequirements?: string;
  public isComplete!: boolean;
  public createdAt!: string;
  public updatedAt!: string;
}

IdealRoommatePreference.init(
  {
    preferenceId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    preferredAgeMin: { type: DataTypes.INTEGER, allowNull: false },
    preferredAgeMax: { type: DataTypes.INTEGER, allowNull: false },
    preferredGender: {
      type: DataTypes.ENUM("male", "female", "non-binary", "no-preference"),
      defaultValue: "no-preference",
    },
    arrangementTypes: { type: DataTypes.TEXT, allowNull: false },
    moveInDate: { type: DataTypes.DATE, allowNull: false },
    budgetMin: { type: DataTypes.INTEGER, allowNull: false },
    budgetMax: { type: DataTypes.INTEGER, allowNull: false },
    preferredLocations: { type: DataTypes.TEXT, allowNull: false },
    preferredOccupationTypes: { type: DataTypes.TEXT, allowNull: false },
    preferredWorkSchedules: { type: DataTypes.TEXT, allowNull: false },
    smokingPreference: {
      type: DataTypes.ENUM("yes", "no", "doesnt-matter"),
      defaultValue: "doesnt-matter",
    },
    petPreference: {
      type: DataTypes.ENUM("yes", "no", "depends"),
      defaultValue: "depends",
    },
    cleanlinessPreference: { type: DataTypes.INTEGER, allowNull: false },
    sociabilityPreference: {
      type: DataTypes.ENUM("very-social", "friendly-private", "quiet-independent", "no-preference"),
      defaultValue: "no-preference",
    },
    noiseLevelPreference: { type: DataTypes.INTEGER, allowNull: false },
    sleepSchedulePreference: {
      type: DataTypes.ENUM("early-bird", "night-owl", "doesnt-matter"),
      defaultValue: "doesnt-matter",
    },
    guestPreference: {
      type: DataTypes.ENUM("yes", "no", "sometimes"),
      defaultValue: "sometimes",
    },
    preferredLanguages: { type: DataTypes.TEXT, allowNull: false },
    openToAnyBackground: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    culturalComments: { type: DataTypes.TEXT, allowNull: true },
    sharedInterests: { type: DataTypes.TEXT, allowNull: false },
    additionalRequirements: { type: DataTypes.TEXT, allowNull: true },
    isComplete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: "IdealRoommatePreference",
    tableName: "ideal_roommate_preferences",
    timestamps: true,
  }
);

// Define associations
IdealRoommatePreference.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(IdealRoommatePreference, { foreignKey: "userId", as: "idealRoommatePreference" });

export default IdealRoommatePreference; 