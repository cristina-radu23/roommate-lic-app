"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/backfill-coords.ts
const db_1 = __importDefault(require("../config/db"));
require("../models"); // Import to register all model associations
const Listing_1 = __importDefault(require("../models/Listing"));
const Address_1 = __importDefault(require("../models/Address"));
const City_1 = __importDefault(require("../models/City"));
const geocoder_1 = __importDefault(require("../utils/geocoder"));
const backfillCoordinates = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting to backfill coordinates for listings...');
    try {
        yield db_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        // Fetch all listings, we'll filter in the loop
        const allListings = yield Listing_1.default.findAll({
            include: [
                {
                    model: Address_1.default,
                    include: [{ model: City_1.default }]
                }
            ]
        });
        console.log(`Found ${allListings.length} total listings. Checking which ones need coordinates...`);
        for (const listing of allListings) {
            // Check if coordinates already exist and are valid
            const lat = listing.latitude;
            const lng = listing.longitude;
            if (lat && lng && lat !== 0 && lng !== 0) {
                console.log(`Skipping listing ${listing.listingId}, it already has coordinates.`);
                continue;
            }
            const address = listing.Address;
            if (!address || !address.City) {
                console.log(`Skipping listing ${listing.listingId} due to missing address or city information.`);
                continue;
            }
            const fullAddress = `${address.streetName} ${address.streetNo}, ${address.City.cityName}`;
            try {
                console.log(`Geocoding address for listing ${listing.listingId}: "${fullAddress}"`);
                const geoResult = yield geocoder_1.default.geocode(fullAddress);
                if (geoResult.length > 0) {
                    const { latitude, longitude } = geoResult[0];
                    console.log(`  -> Found coordinates: Lat ${latitude}, Lng ${longitude}`);
                    yield listing.update({ latitude, longitude });
                    console.log(`  -> Successfully updated listing ${listing.listingId}.`);
                }
                else {
                    console.log(`  -> Could not find coordinates for listing ${listing.listingId}.`);
                }
            }
            catch (geocodeError) {
                console.error(`  -> Geocoding failed for listing ${listing.listingId}:`, geocodeError);
            }
            // Add a small delay to avoid hitting API rate limits
            yield new Promise(resolve => setTimeout(resolve, 1100)); // ~1 request per second
        }
        console.log('Finished backfilling coordinates.');
    }
    catch (error) {
        console.error('An error occurred during the backfill process:', error);
    }
    finally {
        yield db_1.default.close();
        console.log('Database connection closed.');
    }
});
backfillCoordinates();
