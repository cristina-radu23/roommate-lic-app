"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/HouseRule.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class HouseRule extends sequelize_1.Model {
}
HouseRule.init({
    ruleId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "HouseRule",
    tableName: "house_rules",
    timestamps: false,
});
exports.default = HouseRule;
