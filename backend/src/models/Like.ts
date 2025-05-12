import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./User";

interface LikeAttributes {
  likeId: number;
  userId: number;
  listingId: number;
  createdAt?: Date;
  updatedAt?: Date;
  User?: User;
}

interface LikeCreationAttributes extends Optional<LikeAttributes, "likeId" | "createdAt" | "updatedAt" | "User"> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public likeId!: number;
  public userId!: number;
  public listingId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public User?: User;
}

Like.init(
  {
    likeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Like",
    tableName: "likes",
    timestamps: true,
  }
);

export default Like; 