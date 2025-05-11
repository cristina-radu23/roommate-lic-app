import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface PhotoAttributes {
  photoId: number;
  listingId: number;
  url: string;
  isCover?: boolean;
  createdAt?: Date;
}

interface PhotoCreationAttributes extends Optional<PhotoAttributes, "photoId" | "isCover" | "createdAt"> {}

class Photo extends Model<PhotoAttributes, PhotoCreationAttributes> implements PhotoAttributes {
  public photoId!: number;
  public listingId!: number;
  public url!: string;
  public isCover?: boolean;
  public readonly createdAt!: Date;
}

Photo.init(
  {
    photoId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Photo",
    tableName: "photos",
    timestamps: true,
    updatedAt: false,
  }
);

export default Photo;
