import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface NotificationAttributes {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationCreationAttributes extends Optional<NotificationAttributes, "notificationId" | "read" | "createdAt" | "updatedAt"> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public notificationId!: number;
  public userId!: number;
  public type!: string;
  public message!: string;
  public link?: string;
  public read!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    notificationId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    link: { type: DataTypes.STRING, allowNull: true },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
  }
);

export default Notification; 