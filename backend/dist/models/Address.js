"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Address extends sequelize_1.Model {
}
Address.init({
    addressId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cityId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    streetName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    streetNo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "Address",
    tableName: "addresses",
    timestamps: false,
});
exports.default = Address;
