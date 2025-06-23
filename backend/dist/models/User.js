"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
User.init({
    userId: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userFirstName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    userLastName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    phoneNumber: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    dateOfBirth: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    gender: {
        type: sequelize_1.DataTypes.ENUM("male", "female", "not specified"),
        defaultValue: "not specified",
    },
    occupation: {
        type: sequelize_1.DataTypes.ENUM("student", "employeed", "not specified"),
        defaultValue: "not specified",
    },
    passwordHash: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'profilePicture'
    },
    bio: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isEmailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    emailVerificationCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    emailVerificationExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db_1.default,
    modelName: "User",
    tableName: "users",
    timestamps: true,
});
exports.default = User;
