import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface CityAttributes {
  cityId: number;
  countyId: string;
  cityName: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface CityCreationAttributes extends Optional<CityAttributes, "cityId"> {}

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
  public cityId!: number;
  public countyId!: string;
  public cityName!: string;
  public latitude?: number | null;
  public longitude?: number | null;
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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
