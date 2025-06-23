// src/controllers/listingController.ts

import { Request, Response } from "express";
import Listing from "../models/Listing";
import Address from "../models/Address";
import RoomAmenity from "../models/RoomAmenity";
import PropertyAmenity from "../models/PropertyAmenity";
import HouseRule from "../models/HouseRule";
import { AuthenticatedRequest } from "../middleware/authMiddleware"; // ✅
import City from "../models/City";
import { Op } from "sequelize";
import Photo from "../models/Photo";
import User from "../models/User";
import Like from "../models/Like";
import { sendNotification } from "../utils/notify";
import Match from "../models/Match";
import ChatRoom from "../models/ChatRoom";
import ChatRoomUser from "../models/ChatRoomUser";
import Message from "../models/Message";
import geocoder from "../utils/geocoder";

export const createListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      cityId, streetName, streetNo,
      listingType, propertyType, userRole,
      sizeM2, bedroomsSingle, bedroomsDouble,
      flatmatesFemale, flatmatesMale,
      availableFrom, availableTo, openEnded,
      rent, deposit, noDeposit,
      roomSizeM2, hasBed, bedType,
      title, description,
      roomAmenities, propertyAmenities, houseRules
    } = req.body;

    // 1. Create Address
    const address = await Address.create({ streetName, streetNo, cityId });

    // Geocode address
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const cityDetails = await City.findByPk(cityId);
      if (cityDetails) {
        const fullAddress = `${streetName} ${streetNo}, ${cityDetails.cityName}`;
        const geoResult = await geocoder.geocode(fullAddress);
        if (geoResult.length > 0) {
          latitude = geoResult[0].latitude ?? null;
          longitude = geoResult[0].longitude ?? null;
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      // Continue without lat/lng
    }

    // 2. Create Listing
    const listing = await Listing.create({
      userId,
      addressId: address.addressId,
      listingType,
      propertyType,
      userRole,
      sizeM2,
      bedroomsSingle,
      bedroomsDouble,
      flatmatesFemale,
      flatmatesMale,
      availableFrom,
      availableTo,
      openEnded,
      rent,
      deposit,
      noDeposit,
      roomSizeM2,
      hasBed,
      bedType,
      title,
      description,
      latitude,
      longitude
    });

    // 3. Set M:N associations
    if (roomAmenities?.length) {
      const amenities = await RoomAmenity.findAll({ where: { name: roomAmenities } });
      await listing.setRoomAmenities(amenities);
    }

    if (propertyAmenities?.length) {
      const amenities = await PropertyAmenity.findAll({ where: { name: propertyAmenities } });
      await listing.setPropertyAmenities(amenities);
    }

    if (houseRules?.length) {
      const rules = await HouseRule.findAll({ where: { name: houseRules } });
      await listing.setHouseRules(rules);
    }

    // 4. Save photos in Photo table
    console.log("Received photos:", req.body.photos);
    if (req.body.photos && Array.isArray(req.body.photos)) {
      console.log("Saving photos to DB:", req.body.photos);
      for (let i = 0; i < req.body.photos.length; i++) {
        const url = req.body.photos[i];
        await Photo.create({ 
          listingId: listing.listingId, 
          url,
          order: i 
        });
        console.log("Saved photo:", url, "with order:", i);
      }
    }

    return res.status(201).json({ message: "Listing created", listingId: listing.listingId });

  } catch (error) {
    console.error("Error creating listing:", error);
    return res.status(500).json({ error: "Failed to create listing" });
  }
};

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const {
      minRent,
      maxRent,
      listingType,
      propertyType,
      preferredRoommate,
      amenities,
      rules,
      roomAmenities,
      city,
      north,
      south,
      east,
      west
    } = req.query;

    // Debug: print received query params
    console.log("[Listings] Received query params:", req.query);

    // Build where clause
    const where: any = {};
    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent[Op.gte] = Number(minRent);
      if (maxRent) where.rent[Op.lte] = Number(maxRent);
    }
    if (listingType) where.listingType = listingType;
    if (propertyType) where.propertyType = propertyType;
    if (preferredRoommate === "female") where.flatmatesMale = 0;
    if (preferredRoommate === "male") where.flatmatesFemale = 0;

    // Add geographic bounds filtering
    if (north && south && east && west) {
      console.log("[Backend] Applying geographic bounds filtering:", { north, south, east, west });
      // Only include listings that have coordinates and are within bounds
      where.latitude = {
        [Op.and]: [
          { [Op.between]: [Number(south), Number(north)] },
          { [Op.ne]: null }
        ]
      };
      where.longitude = {
        [Op.and]: [
          { [Op.between]: [Number(west), Number(east)] },
          { [Op.ne]: null }
        ]
      };
      console.log("[Backend] Geographic where clause:", where.latitude, where.longitude);
    }

    // Debug: print where clause
    console.log("[Listings] Built where clause:", where);

    // City filter (by cityId)
    let addressInclude: any = {
      model: Address,
      include: [City],
    };
    if (city) {
      addressInclude.where = { cityId: Number(city) };
    }

    // Build include for amenities and rules
    const include: any[] = [
      addressInclude,
      RoomAmenity,
      PropertyAmenity,
      HouseRule,
      {
        model: Photo
      },
      {
        model: User,
        where: { isActive: 1 },
        required: true,
        attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "isActive"]
      }
    ];

    // Filter by property amenities
    if (amenities) {
      let amenityArr: string[] = [];
      if (Array.isArray(amenities)) {
        amenityArr = amenities as string[];
      } else if (typeof amenities === "string") {
        amenityArr = (amenities as string).split(",");
      }
      if (amenityArr.length > 0) {
        include[2] = {
          model: PropertyAmenity,
          where: { name: amenityArr },
          required: true,
        };
      }
    }
    // Filter by house rules
    if (rules) {
      let rulesArr: string[] = [];
      if (Array.isArray(rules)) {
        rulesArr = rules as string[];
      } else if (typeof rules === "string") {
        rulesArr = (rules as string).split(",");
      }
      if (rulesArr.length > 0) {
        include[3] = {
          model: HouseRule,
          where: { name: rulesArr },
          required: true,
        };
      }
    }
    // Filter by room amenities
    if (roomAmenities) {
      let roomAmenityArr: string[] = [];
      if (Array.isArray(roomAmenities)) {
        roomAmenityArr = roomAmenities as string[];
      } else if (typeof roomAmenities === "string") {
        roomAmenityArr = (roomAmenities as string).split(",");
      }
      if (roomAmenityArr.length > 0) {
        include[1] = {
          model: RoomAmenity,
          where: { name: roomAmenityArr },
          required: true,
        };
      }
    }

    // Debug: print include array
    console.log("[Listings] Built include array:", JSON.stringify(include, null, 2));

    const listings = await Listing.findAll({
      where,
      include,
      order: [
        ['createdAt', 'DESC'],
        [{ model: Photo, as: 'Photos' }, 'order', 'ASC']
      ]
    });

    // Add likesCount to each listing and handle inactive users' profile pictures
    const listingsWithLikes = await Promise.all(listings.map(async (listing: any) => {
      const likesCount = await Like.count({ where: { listingId: listing.listingId } });
      const listingData = listing.toJSON();
      
      // Handle user profile picture based on active status
      if (listingData.User) {
        listingData.User.profilePicture = listingData.User.isActive ? listingData.User.profilePicture : null;
      }
      
      return { ...listingData, likesCount };
    }));
    res.status(200).json(listingsWithLikes);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const getListingsByCity = async (req: Request, res: Response) => {
  const { cityId } = req.params;

  try {
    const listings = await Listing.findAll({
      include: [
        {
          model: Address,
          where: { cityId: Number(cityId) }, // 👈 force to number
          include: [City],
        },
        RoomAmenity,
        PropertyAmenity,
        HouseRule,
        {
          model: Photo
        },
        {
          model: User,
          where: { isActive: 1 },
          required: true,
          attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "isActive"]
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Photo, as: 'Photos' }, 'order', 'ASC']
      ]
    });

    // Add likesCount to each listing and handle inactive users' profile pictures
    const listingsWithLikes = await Promise.all(listings.map(async (listing: any) => {
      const likesCount = await Like.count({ where: { listingId: listing.listingId } });
      const listingData = listing.toJSON();
      
      // Handle user profile picture based on active status
      if (listingData.User) {
        listingData.User.profilePicture = listingData.User.isActive ? listingData.User.profilePicture : null;
      }
      
      return { ...listingData, likesCount };
    }));
    res.status(200).json(listingsWithLikes);
  } catch (error) {
    console.error("Error fetching listings by city:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findOne({
      where: { listingId: id },
      include: [
        {
          model: Address,
          include: [City],
        },
        {
          model: Photo
        },
        {
          model: RoomAmenity,
        },
        {
          model: PropertyAmenity,
        },
        {
          model: HouseRule,
        },
        {
          model: User,
          where: { isActive: 1 },
          required: true,
          attributes: ["userId", "userFirstName", "userLastName", "phoneNumber", "profilePicture", "isActive"],
        },
      ],
      order: [
        [{ model: Photo, as: 'Photos' }, 'order', 'ASC']
      ]
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Increment views
    await listing.increment('views');
    await listing.reload();

    // Use direct property access for associations
    const userInstance = (listing as any).User;
    const addressInstance = (listing as any).Address;

    console.log('userInstance:', userInstance);
    if (userInstance) {
      console.log('userInstance.profilePicture:', userInstance.profilePicture);
    }

    const user = (userInstance && typeof userInstance === 'object' && 'userFirstName' in userInstance && 'userLastName' in userInstance && 'phoneNumber' in userInstance)
      ? {
          name: `${userInstance.userFirstName} ${userInstance.userLastName}`,
          phone: userInstance.phoneNumber,
          userId: userInstance.userId,
          profilePicture: userInstance.isActive ? userInstance.profilePicture : null
        }
      : undefined;

    console.log('user object sent to frontend:', user);

    let cityName: string | undefined = undefined;
    if (addressInstance && typeof addressInstance === 'object' && 'City' in addressInstance) {
      const city = addressInstance.City;
      if (city && typeof city === 'object' && 'cityName' in city) {
        cityName = city.cityName;
      }
    }
    // Add likesCount
    const likesCount = await Like.count({ where: { listingId: listing.listingId } });

    // Map photos to a simple array of URLs
    const photoInstances = (listing as any).Photos || (listing as any).Photo || [];
    const photos = Array.isArray(photoInstances)
      ? photoInstances.map((p: any) => p.url)
      : [];

    res.json({
      ...listing.toJSON(),
      user,
      cityName,
      likesCount,
      views: listing.views,
      photos,
    });
  } catch (error) {
    console.error("Error fetching listing by id:", error);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};

export const getUserListings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const listings = await Listing.findAll({
      where: { userId },
      include: [
        {
          model: Address,
          include: [City],
        },
        RoomAmenity,
        PropertyAmenity,
        HouseRule,
        {
          model: Photo
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Photo, as: 'Photos' }, 'order', 'ASC']
      ]
    });

    // Add likesCount to each listing
    const listingsWithLikes = await Promise.all(listings.map(async (listing: any) => {
      const likesCount = await Like.count({ where: { listingId: listing.listingId } });
      return { ...listing.toJSON(), likesCount };
    }));
    res.status(200).json(listingsWithLikes);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ error: "Failed to fetch user listings" });
  }
};

export const deleteListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { listingId } = req.params;
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this listing" });
    }

    // Delete all photos associated with this listing first
    await Photo.destroy({ where: { listingId: listing.listingId } });
    console.log(`Deleted photos for listing ${listingId}`);

    // Delete all likes associated with this listing
    await Like.destroy({ where: { listingId: listing.listingId } });
    console.log(`Deleted likes for listing ${listingId}`);

    // Delete all chat-related data
    // First, find all chat rooms for this listing
    const chatRooms = await ChatRoom.findAll({ where: { listingId: listing.listingId } });
    const chatRoomIds = chatRooms.map(room => room.chatRoomId);
    
    if (chatRoomIds.length > 0) {
      // Delete all messages in these chat rooms
      await Message.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } });
      console.log(`Deleted messages for chat rooms: ${chatRoomIds.join(', ')}`);
      
      // Delete all chat room user associations
      await ChatRoomUser.destroy({ where: { chatRoomId: { [Op.in]: chatRoomIds } } });
      console.log(`Deleted chat room users for chat rooms: ${chatRoomIds.join(', ')}`);
    }
    
    // Delete the chat rooms themselves
    await ChatRoom.destroy({ where: { listingId: listing.listingId } });
    console.log(`Deleted chat rooms for listing ${listingId}`);

    // Now delete the listing itself
    await listing.destroy();
    console.log(`Deleted listing ${listingId}`);

    return res.json({ message: "Listing deleted successfully" });

  } catch (error) {
    console.error("Error deleting listing:", error);
    return res.status(500).json({ error: "Failed to delete listing" });
  }
};

export const updateListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { listingId } = req.params;
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this listing" });
    }

    const {
      cityId, streetName, streetNo,
      listingType, propertyType, userRole,
      sizeM2, bedroomsSingle, bedroomsDouble,
      flatmatesFemale, flatmatesMale,
      availableFrom, availableTo, openEnded,
      rent, deposit, noDeposit,
      roomSizeM2, hasBed, bedType,
      title, description,
      roomAmenities, propertyAmenities, houseRules,
      photos // New photos to add
    } = req.body;

    // Update Address
    const address = await Address.findByPk(listing.addressId);
    if (address) {
      await address.update({ streetName, streetNo, cityId });
    }

    // Update Listing
    await listing.update({
      listingType,
      propertyType,
      userRole,
      sizeM2,
      bedroomsSingle,
      bedroomsDouble,
      flatmatesFemale,
      flatmatesMale,
      availableFrom,
      availableTo,
      openEnded,
      rent,
      deposit,
      noDeposit,
      roomSizeM2,
      hasBed,
      bedType,
      title,
      description
    });

    // Update M:N associations
    if (roomAmenities && Array.isArray(roomAmenities)) {
      if (roomAmenities.length > 0) {
        const amenities = await RoomAmenity.findAll({ where: { name: roomAmenities } });
        await listing.setRoomAmenities(amenities);
      } else {
        // Clear all room amenities if empty array is provided
        await listing.setRoomAmenities([]);
      }
    }

    if (propertyAmenities && Array.isArray(propertyAmenities)) {
      if (propertyAmenities.length > 0) {
        const amenities = await PropertyAmenity.findAll({ where: { name: propertyAmenities } });
        await listing.setPropertyAmenities(amenities);
      } else {
        // Clear all property amenities if empty array is provided
        await listing.setPropertyAmenities([]);
      }
    }

    if (houseRules && Array.isArray(houseRules)) {
      if (houseRules.length > 0) {
        const rules = await HouseRule.findAll({ where: { name: houseRules } });
        await listing.setHouseRules(rules);
      } else {
        // Clear all house rules if empty array is provided
        await listing.setHouseRules([]);
      }
    }

    // Add new photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      console.log("Adding new photos to listing:", photos);
      
      // Get the current highest order
      const currentPhotos = await Photo.findAll({ 
        where: { listingId: listing.listingId },
        order: [['order', 'DESC']],
        limit: 1
      });
      const nextOrder = currentPhotos.length > 0 ? (currentPhotos[0].order || 0) + 1 : 0;
      
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i];
        await Photo.create({ 
          listingId: listing.listingId, 
          url,
          order: nextOrder + i 
        });
        console.log("Added photo:", url, "with order:", nextOrder + i);
      }
    }

    // Handle photo updates (replace all photos)
    if (req.body.updatedPhotos && Array.isArray(req.body.updatedPhotos)) {
      console.log("Updating photos for listing:", req.body.updatedPhotos);
      
      // Delete all existing photos for this listing
      await Photo.destroy({ where: { listingId: listing.listingId } });
      
      // Add the new photo list with proper order
      for (let i = 0; i < req.body.updatedPhotos.length; i++) {
        const url = req.body.updatedPhotos[i];
        await Photo.create({ 
          listingId: listing.listingId, 
          url,
          order: i 
        });
        console.log("Updated photo:", url, "with order:", i);
      }
    }

    return res.json({ message: "Listing updated successfully", listingId: listing.listingId });

  } catch (error) {
    console.error("Error updating listing:", error);
    return res.status(500).json({ error: "Failed to update listing" });
  }
};