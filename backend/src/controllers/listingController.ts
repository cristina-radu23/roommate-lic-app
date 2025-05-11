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
      description
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
      for (const url of req.body.photos) {
        await Photo.create({ listingId: listing.listingId, url });
        console.log("Saved photo:", url);
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
      city
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
      Photo,
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
    });

    res.status(200).json(listings);
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
        Photo,
      ],
    });

    res.status(200).json(listings);
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
          model: Photo,
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
          attributes: ["userId", "userFirstName", "userLastName", "phoneNumber", "profilePicture"],
        },
      ],
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

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
          profilePicture: userInstance.profilePicture || null
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

    res.json({
      ...listing.toJSON(),
      user,
      cityName,
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
        Photo,
      ],
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ error: "Failed to fetch user listings" });
  }
};