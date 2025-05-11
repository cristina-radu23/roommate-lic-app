import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface DistrictAttributes {
  districtId: number;
  cityId: number;
  districtName: string;
}

interface DistrictCreationAttributes extends Optional<DistrictAttributes, "districtId"> {}

class District extends Model<DistrictAttributes, DistrictCreationAttributes> implements DistrictAttributes {
  public districtId!: number;
  public cityId!: number;
  public districtName!: string;
}

District.init(
  {
    districtId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    districtName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "District",
    tableName: "districts",
    timestamps: false,
  }
);

export default District;
