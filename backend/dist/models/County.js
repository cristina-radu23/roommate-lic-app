"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class County extends sequelize_1.Model {
}
County.init({
    countyId: {
        type: sequelize_1.DataTypes.STRING(3),
        primaryKey: true,
    },
    countyName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "County",
    tableName: "counties",
    timestamps: false,
});
exports.default = County;
