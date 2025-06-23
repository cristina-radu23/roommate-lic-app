"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Match extends sequelize_1.Model {
}
Match.init({
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userAId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    userBId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    isMatch: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    userAConfirmed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    userBConfirmed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "Match",
    tableName: "matches",
    timestamps: true,
});
exports.default = Match;
