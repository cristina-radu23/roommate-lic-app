import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface MatchAttributes {
  matchId: number;
  userAId: number;
  userBId: number;
  listingId?: number | null;
  announcementId?: number | null;
  isMatch: boolean;
  userAConfirmed: boolean;
  userBConfirmed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchCreationAttributes extends Optional<MatchAttributes, "matchId" | "isMatch" | "userAConfirmed" | "userBConfirmed" | "createdAt" | "updatedAt" | "listingId" | "announcementId"> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public matchId!: number;
  public userAId!: number;
  public userBId!: number;
  public listingId?: number | null;
  public announcementId?: number | null;
  public isMatch!: boolean;
  public userAConfirmed!: boolean;
  public userBConfirmed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    matchId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userAId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userBId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    announcementId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isMatch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userAConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userBConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Match",
    tableName: "matches",
    timestamps: true,
  }
);

export default Match; 