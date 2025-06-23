"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/RoomAmenity.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class RoomAmenity extends sequelize_1.Model {
}
RoomAmenity.init({
    amenityId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "RoomAmenity",
    tableName: "room_amenities",
    timestamps: false,
});
exports.default = RoomAmenity;
