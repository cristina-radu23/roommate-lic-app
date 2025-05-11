// models/PropertyAmenity.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface PropertyAmenityAttributes {
  amenityId: number;
  name: string;
}

interface PropertyAmenityCreationAttributes extends Optional<PropertyAmenityAttributes, "amenityId"> {}

class PropertyAmenity extends Model<PropertyAmenityAttributes, PropertyAmenityCreationAttributes> implements PropertyAmenityAttributes {
  public amenityId!: number;
  public name!: string;
}

PropertyAmenity.init(
  {
    amenityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "PropertyAmenity",
    tableName: "property_amenities",
    timestamps: false,
  }
);

export default PropertyAmenity;
