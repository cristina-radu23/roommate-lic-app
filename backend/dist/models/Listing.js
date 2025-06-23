"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Listing extends sequelize_1.Model {
}
Listing.init({
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    addressId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    listingType: {
        type: sequelize_1.DataTypes.ENUM("room", "entire_property"),
        allowNull: false,
    },
    propertyType: {
        type: sequelize_1.DataTypes.ENUM("apartment", "house"),
        allowNull: false,
    },
    userRole: {
        type: sequelize_1.DataTypes.ENUM("owner", "tenant"),
        allowNull: false,
    },
    sizeM2: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    bedroomsSingle: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    bedroomsDouble: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    flatmatesFemale: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    flatmatesMale: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    availableFrom: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    availableTo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    openEnded: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    rent: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    deposit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    noDeposit: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    roomSizeM2: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    hasBed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    bedType: {
        type: sequelize_1.DataTypes.ENUM("sofa_bed", "single", "double"),
        allowNull: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    views: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    latitude: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    longitude: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Listing",
    tableName: "listings",
    timestamps: true,
});
exports.default = Listing;
