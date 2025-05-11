// models/HouseRule.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface HouseRuleAttributes {
  ruleId: number;
  name: string;
}

interface HouseRuleCreationAttributes extends Optional<HouseRuleAttributes, "ruleId"> {}

class HouseRule extends Model<HouseRuleAttributes, HouseRuleCreationAttributes> implements HouseRuleAttributes {
  public ruleId!: number;
  public name!: string;
}

HouseRule.init(
  {
    ruleId: {
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
    modelName: "HouseRule",
    tableName: "house_rules",
    timestamps: false,
  }
);

export default HouseRule;
