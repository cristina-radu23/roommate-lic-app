import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface AddressAttributes {
  addressId: number;
  cityId: number;
  streetName: string;
  streetNo: string;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, "addressId"> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public addressId!: number;
  public cityId!: number;
  public streetName!: string;
  public streetNo!: string;
}

Address.init(
  {
    addressId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    streetName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    streetNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Address",
    tableName: "addresses",
    timestamps: false,
  }
);

export default Address;
