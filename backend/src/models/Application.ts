import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface ApplicationAttributes {
  applicationId: number;
  listingId: number;
  applicantIds: string; // JSON array of user IDs
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationCreationAttributes extends Optional<ApplicationAttributes, "applicationId" | "status" | "createdAt" | "updatedAt"> {}

class Application extends Model<ApplicationAttributes, ApplicationCreationAttributes> implements ApplicationAttributes {
  public applicationId!: number;
  public listingId!: number;
  public applicantIds!: string;
  public status!: "pending" | "approved" | "rejected";
  public message?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Application.init(
  {
    applicationId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    listingId: { type: DataTypes.INTEGER, allowNull: false },
    applicantIds: { type: DataTypes.TEXT, allowNull: false }, // JSON array of user IDs
    status: { 
      type: DataTypes.ENUM("pending", "approved", "rejected"), 
      allowNull: false, 
      defaultValue: "pending" 
    },
    message: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Application",
    tableName: "applications",
    timestamps: true,
  }
);

export default Application; 