"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load the config file
const configPath = path_1.default.join(__dirname, "../../config/config.json");
const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
// Get the development config
const devConfig = config.development;
const sequelize = new sequelize_1.Sequelize({
    dialect: "sqlite",
    storage: path_1.default.join(__dirname, "../../", devConfig.storage),
    logging: console.log, // Changed to log SQL queries for debugging
});
exports.default = sequelize;
