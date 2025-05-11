import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface CityAttributes {
  cityId: number;
  countyId: string;
  cityName: string;
}

interface CityCreationAttributes extends Optional<CityAttributes, "cityId"> {}

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public cityId!: number;
  public countyId!: string;
  public cityName!: string;
}

City.init(
  {
    cityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    countyId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "City",
    tableName: "cities",
    timestamps: false,
  }
);

export default City;
