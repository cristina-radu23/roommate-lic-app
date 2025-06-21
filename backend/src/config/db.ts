import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";

// Load the config file
const configPath = path.join(__dirname, "../../config/config.json");
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Get the development config
const devConfig = config.development;

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../", devConfig.storage),
  logging: console.log, // Changed to log SQL queries for debugging
});

export default sequelize;
