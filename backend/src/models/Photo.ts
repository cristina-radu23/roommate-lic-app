import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface PhotoAttributes {
  photoId: number;
  listingId?: number;
  announcementId?: number;
  url: string;
  isCover?: boolean;
  order?: number;
  createdAt?: Date;
}

interface PhotoCreationAttributes extends Optional<PhotoAttributes, "photoId" | "isCover" | "order" | "createdAt"> {}

class Photo extends Model<PhotoAttributes, PhotoCreationAttributes> implements PhotoAttributes {
  public photoId!: number;
  public listingId?: number;
  public announcementId?: number;
  public url!: string;
  public isCover?: boolean;
  public order?: number;
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
      allowNull: true,
    },
    announcementId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
