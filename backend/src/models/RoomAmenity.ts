// models/RoomAmenity.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class RoomAmenity extends Model {
  public amenityId!: number;
  public name!: string;
}

RoomAmenity.init(
  {
    amenityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RoomAmenity",
    tableName: "room_amenities",
    timestamps: false,
  }
);

export default RoomAmenity;
