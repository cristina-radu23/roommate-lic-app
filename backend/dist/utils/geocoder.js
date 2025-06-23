"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const options = {
    provider: 'openstreetmap',
    // Optional depending on the providers
    // fetch: customFetchImplementation,
    // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};
const geocoder = (0, node_geocoder_1.default)(options);
exports.default = geocoder;
