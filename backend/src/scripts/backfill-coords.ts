// src/scripts/backfill-coords.ts
import sequelize from '../config/db';
import '../models'; // Import to register all model associations
import { Op } from 'sequelize';
import Listing from '../models/Listing';
import Address from '../models/Address';
import City from '../models/City';
import geocoder from '../utils/geocoder';

const backfillCoordinates = async () => {
  console.log('Starting to backfill coordinates for listings...');
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Fetch all listings, we'll filter in the loop
    const allListings = await Listing.findAll({
      include: [
        {
          model: Address,
          include: [{ model: City }]
        }
      ]
    });

    console.log(`Found ${allListings.length} total listings. Checking which ones need coordinates...`);

    for (const listing of allListings) {
      // Check if coordinates already exist and are valid
      const lat = (listing as any).latitude;
      const lng = (listing as any).longitude;
      if (lat && lng && lat !== 0 && lng !== 0) {
        console.log(`Skipping listing ${listing.listingId}, it already has coordinates.`);
        continue;
      }

      const address = (listing as any).Address;
      if (!address || !address.City) {
        console.log(`Skipping listing ${listing.listingId} due to missing address or city information.`);
        continue;
      }
      
      const fullAddress = `${address.streetName} ${address.streetNo}, ${address.City.cityName}`;
      
      try {
        console.log(`Geocoding address for listing ${listing.listingId}: "${fullAddress}"`);
        const geoResult = await geocoder.geocode(fullAddress);
        
        if (geoResult.length > 0) {
          const { latitude, longitude } = geoResult[0];
          console.log(`  -> Found coordinates: Lat ${latitude}, Lng ${longitude}`);
          
          await listing.update({ latitude, longitude });
          console.log(`  -> Successfully updated listing ${listing.listingId}.`);
        } else {
          console.log(`  -> Could not find coordinates for listing ${listing.listingId}.`);
        }
      } catch (geocodeError) {
        console.error(`  -> Geocoding failed for listing ${listing.listingId}:`, geocodeError);
      }
      // Add a small delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 1100)); // ~1 request per second
    }

    console.log('Finished backfilling coordinates.');

  } catch (error) {
    console.error('An error occurred during the backfill process:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

backfillCoordinates(); 