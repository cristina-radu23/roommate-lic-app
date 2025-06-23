"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/PropertyAmenity.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class PropertyAmenity extends sequelize_1.Model {
}
PropertyAmenity.init({
    amenityId: {
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
    modelName: "PropertyAmenity",
    tableName: "property_amenities",
    timestamps: false,
});
exports.default = PropertyAmenity;
