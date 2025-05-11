import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

interface CountyAttributes {
  countyId: string; // changed to string (e.g., "CJ")
  countyName: string;
}

class County extends Model<CountyAttributes> implements CountyAttributes {
  public countyId!: string;
  public countyName!: string;
}

County.init(
  {
    countyId: {
      type: DataTypes.STRING(3),
      primaryKey: true,
    },
    countyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "County",
    tableName: "counties",
    timestamps: false,
  }
);

export default County;
