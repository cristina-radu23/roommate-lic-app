"use strict";
// src/controllers/listingController.ts
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
exports.updateListing = exports.deleteListing = exports.getUserListings = exports.getListingById = exports.getListingsByCity = exports.getAllListings = exports.createListing = void 0;
const Listing_1 = __importDefault(require("../models/Listing"));
const Address_1 = __importDefault(require("../models/Address"));
const RoomAmenity_1 = __importDefault(require("../models/RoomAmenity"));
const PropertyAmenity_1 = __importDefault(require("../models/PropertyAmenity"));
const HouseRule_1 = __importDefault(require("../models/HouseRule"));
const City_1 = __importDefault(require("../models/City"));
const sequelize_1 = require("sequelize");
const Photo_1 = __importDefault(require("../models/Photo"));
const User_1 = __importDefault(require("../models/User"));
const Like_1 = __importDefault(require("../models/Like"));
const ChatRoom_1 = __importDefault(require("../models/ChatRoom"));
const ChatRoomUser_1 = __importDefault(require("../models/ChatRoomUser"));
const Message_1 = __importDefault(require("../models/Message"));
const geocoder_1 = __importDefault(require("../utils/geocoder"));
const createListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { cityId, streetName, streetNo, listingType, propertyType, userRole, sizeM2, bedroomsSingle, bedroomsDouble, flatmatesFemale, flatmatesMale, availableFrom, availableTo, openEnded, rent, deposit, noDeposit, roomSizeM2, hasBed, bedType, title, description, roomAmenities, propertyAmenities, houseRules } = req.body;
        // 1. Create Address
        const address = yield Address_1.default.create({ streetName, streetNo, cityId });
        // Geocode address
        let latitude = null;
        let longitude = null;
        try {
            const cityDetails = yield City_1.default.findByPk(cityId);
            if (cityDetails) {
                const fullAddress = `${streetName} ${streetNo}, ${cityDetails.cityName}`;
                const geoResult = yield geocoder_1.default.geocode(fullAddress);
                if (geoResult.length > 0) {
                    latitude = (_b = geoResult[0].latitude) !== null && _b !== void 0 ? _b : null;
                    longitude = (_c = geoResult[0].longitude) !== null && _c !== void 0 ? _c : null;
                }
            }
        }
        catch (error) {
            console.error("Geocoding failed:", error);
            // Continue without lat/lng
        }
        // 2. Create Listing
        const listing = yield Listing_1.default.create({
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
        if (roomAmenities === null || roomAmenities === void 0 ? void 0 : roomAmenities.length) {
            const amenities = yield RoomAmenity_1.default.findAll({ where: { name: roomAmenities } });
            yield listing.setRoomAmenities(amenities);
        }
        if (propertyAmenities === null || propertyAmenities === void 0 ? void 0 : propertyAmenities.length) {
            const amenities = yield PropertyAmenity_1.default.findAll({ where: { name: propertyAmenities } });
            yield listing.setPropertyAmenities(amenities);
        }
        if (houseRules === null || houseRules === void 0 ? void 0 : houseRules.length) {
            const rules = yield HouseRule_1.default.findAll({ where: { name: houseRules } });
            yield listing.setHouseRules(rules);
        }
        // 4. Save photos in Photo table
        console.log("Received photos:", req.body.photos);
        if (req.body.photos && Array.isArray(req.body.photos)) {
            console.log("Saving photos to DB:", req.body.photos);
            for (let i = 0; i < req.body.photos.length; i++) {
                const url = req.body.photos[i];
                yield Photo_1.default.create({
                    listingId: listing.listingId,
                    url,
                    order: i
                });
                console.log("Saved photo:", url, "with order:", i);
            }
        }
        return res.status(201).json({ message: "Listing created", listingId: listing.listingId });
    }
    catch (error) {
        console.error("Error creating listing:", error);
        return res.status(500).json({ error: "Failed to create listing" });
    }
});
exports.createListing = createListing;
const getAllListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { minRent, maxRent, listingType, propertyType, preferredRoommate, amenities, rules, roomAmenities, city, north, south, east, west } = req.query;
        // Debug: print received query params
        console.log("[Listings] Received query params:", req.query);
        // Build where clause
        const where = {};
        if (minRent || maxRent) {
            where.rent = {};
            if (minRent)
                where.rent[sequelize_1.Op.gte] = Number(minRent);
            if (maxRent)
                where.rent[sequelize_1.Op.lte] = Number(maxRent);
        }
        if (listingType)
            where.listingType = listingType;
        if (propertyType)
            where.propertyType = propertyType;
        if (preferredRoommate === "female")
            where.flatmatesMale = 0;
        if (preferredRoommate === "male")
            where.flatmatesFemale = 0;
        // Add geographic bounds filtering
        if (north && south && east && west) {
            console.log("[Backend] Applying geographic bounds filtering:", { north, south, east, west });
            // Only include listings that have coordinates and are within bounds
            where.latitude = {
                [sequelize_1.Op.and]: [
                    { [sequelize_1.Op.between]: [Number(south), Number(north)] },
                    { [sequelize_1.Op.ne]: null }
                ]
            };
            where.longitude = {
                [sequelize_1.Op.and]: [
                    { [sequelize_1.Op.between]: [Number(west), Number(east)] },
                    { [sequelize_1.Op.ne]: null }
                ]
            };
            console.log("[Backend] Geographic where clause:", where.latitude, where.longitude);
        }
        // Debug: print where clause
        console.log("[Listings] Built where clause:", where);
        // City filter (by cityId)
        let addressInclude = {
            model: Address_1.default,
            include: [City_1.default],
        };
        if (city) {
            addressInclude.where = { cityId: Number(city) };
        }
        // Build include for amenities and rules
        const include = [
            addressInclude,
            RoomAmenity_1.default,
            PropertyAmenity_1.default,
            HouseRule_1.default,
            {
                model: Photo_1.default
            },
            {
                model: User_1.default,
                where: { isActive: 1 },
                required: true,
                attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "isActive"]
            }
        ];
        // Filter by property amenities
        if (amenities) {
            let amenityArr = [];
            if (Array.isArray(amenities)) {
                amenityArr = amenities;
            }
            else if (typeof amenities === "string") {
                amenityArr = amenities.split(",");
            }
            if (amenityArr.length > 0) {
                include[2] = {
                    model: PropertyAmenity_1.default,
                    where: { name: amenityArr },
                    required: true,
                };
            }
        }
        // Filter by house rules
        if (rules) {
            let rulesArr = [];
            if (Array.isArray(rules)) {
                rulesArr = rules;
            }
            else if (typeof rules === "string") {
                rulesArr = rules.split(",");
            }
            if (rulesArr.length > 0) {
                include[3] = {
                    model: HouseRule_1.default,
                    where: { name: rulesArr },
                    required: true,
                };
            }
        }
        // Filter by room amenities
        if (roomAmenities) {
            let roomAmenityArr = [];
            if (Array.isArray(roomAmenities)) {
                roomAmenityArr = roomAmenities;
            }
            else if (typeof roomAmenities === "string") {
                roomAmenityArr = roomAmenities.split(",");
            }
            if (roomAmenityArr.length > 0) {
                include[1] = {
                    model: RoomAmenity_1.default,
                    where: { name: roomAmenityArr },
                    required: true,
                };
            }
        }
        // Debug: print include array
        console.log("[Listings] Built include array:", JSON.stringify(include, null, 2));
        const listings = yield Listing_1.default.findAll({
            where,
            include,
            order: [
                ['createdAt', 'DESC'],
                [{ model: Photo_1.default, as: 'Photos' }, 'order', 'ASC']
            ]
        });
        // Add likesCount to each listing and handle inactive users' profile pictures
        const listingsWithLikes = yield Promise.all(listings.map((listing) => __awaiter(void 0, void 0, void 0, function* () {
            const likesCount = yield Like_1.default.count({ where: { listingId: listing.listingId } });
            const listingData = listing.toJSON();
            // Handle user profile picture based on active status
            if (listingData.User) {
                listingData.User.profilePicture = listingData.User.isActive ? listingData.User.profilePicture : null;
            }
            return Object.assign(Object.assign({}, listingData), { likesCount });
        })));
        res.status(200).json(listingsWithLikes);
    }
    catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});
exports.getAllListings = getAllListings;
const getListingsByCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cityId } = req.params;
    try {
        const listings = yield Listing_1.default.findAll({
            include: [
                {
                    model: Address_1.default,
                    where: { cityId: Number(cityId) }, // 👈 force to number
                    include: [City_1.default],
                },
                RoomAmenity_1.default,
                PropertyAmenity_1.default,
                HouseRule_1.default,
                {
                    model: Photo_1.default
                },
                {
                    model: User_1.default,
                    where: { isActive: 1 },
                    required: true,
                    attributes: ["userId", "userFirstName", "userLastName", "profilePicture", "isActive"]
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Photo_1.default, as: 'Photos' }, 'order', 'ASC']
            ]
        });
        // Add likesCount to each listing and handle inactive users' profile pictures
        const listingsWithLikes = yield Promise.all(listings.map((listing) => __awaiter(void 0, void 0, void 0, function* () {
            const likesCount = yield Like_1.default.count({ where: { listingId: listing.listingId } });
            const listingData = listing.toJSON();
            // Handle user profile picture based on active status
            if (listingData.User) {
                listingData.User.profilePicture = listingData.User.isActive ? listingData.User.profilePicture : null;
            }
            return Object.assign(Object.assign({}, listingData), { likesCount });
        })));
        res.status(200).json(listingsWithLikes);
    }
    catch (error) {
        console.error("Error fetching listings by city:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});
exports.getListingsByCity = getListingsByCity;
const getListingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const listing = yield Listing_1.default.findOne({
            where: { listingId: id },
            include: [
                {
                    model: Address_1.default,
                    include: [City_1.default],
                },
                {
                    model: Photo_1.default
                },
                {
                    model: RoomAmenity_1.default,
                },
                {
                    model: PropertyAmenity_1.default,
                },
                {
                    model: HouseRule_1.default,
                },
                {
                    model: User_1.default,
                    where: { isActive: 1 },
                    required: true,
                    attributes: ["userId", "userFirstName", "userLastName", "phoneNumber", "profilePicture", "isActive"],
                },
            ],
            order: [
                [{ model: Photo_1.default, as: 'Photos' }, 'order', 'ASC']
            ]
        });
        if (!listing)
            return res.status(404).json({ error: "Listing not found" });
        // Increment views
        yield listing.increment('views');
        yield listing.reload();
        // Use direct property access for associations
        const userInstance = listing.User;
        const addressInstance = listing.Address;
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
        let cityName = undefined;
        if (addressInstance && typeof addressInstance === 'object' && 'City' in addressInstance) {
            const city = addressInstance.City;
            if (city && typeof city === 'object' && 'cityName' in city) {
                cityName = city.cityName;
            }
        }
        // Add likesCount
        const likesCount = yield Like_1.default.count({ where: { listingId: listing.listingId } });
        res.json(Object.assign(Object.assign({}, listing.toJSON()), { user,
            cityName,
            likesCount, views: listing.views }));
    }
    catch (error) {
        console.error("Error fetching listing by id:", error);
        res.status(500).json({ error: "Failed to fetch listing" });
    }
});
exports.getListingById = getListingById;
const getUserListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const listings = yield Listing_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: Address_1.default,
                    include: [City_1.default],
                },
                RoomAmenity_1.default,
                PropertyAmenity_1.default,
                HouseRule_1.default,
                {
                    model: Photo_1.default
                },
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Photo_1.default, as: 'Photos' }, 'order', 'ASC']
            ]
        });
        // Add likesCount to each listing
        const listingsWithLikes = yield Promise.all(listings.map((listing) => __awaiter(void 0, void 0, void 0, function* () {
            const likesCount = yield Like_1.default.count({ where: { listingId: listing.listingId } });
            return Object.assign(Object.assign({}, listing.toJSON()), { likesCount });
        })));
        res.status(200).json(listingsWithLikes);
    }
    catch (error) {
        console.error("Error fetching user listings:", error);
        res.status(500).json({ error: "Failed to fetch user listings" });
    }
});
exports.getUserListings = getUserListings;
const deleteListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { listingId } = req.params;
        const listing = yield Listing_1.default.findByPk(listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        if (listing.userId !== userId) {
            return res.status(403).json({ error: "Not authorized to delete this listing" });
        }
        // Delete all photos associated with this listing first
        yield Photo_1.default.destroy({ where: { listingId: listing.listingId } });
        console.log(`Deleted photos for listing ${listingId}`);
        // Delete all likes associated with this listing
        yield Like_1.default.destroy({ where: { listingId: listing.listingId } });
        console.log(`Deleted likes for listing ${listingId}`);
        // Delete all chat-related data
        // First, find all chat rooms for this listing
        const chatRooms = yield ChatRoom_1.default.findAll({ where: { listingId: listing.listingId } });
        const chatRoomIds = chatRooms.map(room => room.chatRoomId);
        if (chatRoomIds.length > 0) {
            // Delete all messages in these chat rooms
            yield Message_1.default.destroy({ where: { chatRoomId: { [sequelize_1.Op.in]: chatRoomIds } } });
            console.log(`Deleted messages for chat rooms: ${chatRoomIds.join(', ')}`);
            // Delete all chat room user associations
            yield ChatRoomUser_1.default.destroy({ where: { chatRoomId: { [sequelize_1.Op.in]: chatRoomIds } } });
            console.log(`Deleted chat room users for chat rooms: ${chatRoomIds.join(', ')}`);
        }
        // Delete the chat rooms themselves
        yield ChatRoom_1.default.destroy({ where: { listingId: listing.listingId } });
        console.log(`Deleted chat rooms for listing ${listingId}`);
        // Now delete the listing itself
        yield listing.destroy();
        console.log(`Deleted listing ${listingId}`);
        return res.json({ message: "Listing deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting listing:", error);
        return res.status(500).json({ error: "Failed to delete listing" });
    }
});
exports.deleteListing = deleteListing;
const updateListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        const { listingId } = req.params;
        const listing = yield Listing_1.default.findByPk(listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        if (listing.userId !== userId) {
            return res.status(403).json({ error: "Not authorized to update this listing" });
        }
        const { cityId, streetName, streetNo, listingType, propertyType, userRole, sizeM2, bedroomsSingle, bedroomsDouble, flatmatesFemale, flatmatesMale, availableFrom, availableTo, openEnded, rent, deposit, noDeposit, roomSizeM2, hasBed, bedType, title, description, roomAmenities, propertyAmenities, houseRules, photos // New photos to add
         } = req.body;
        // Update Address
        const address = yield Address_1.default.findByPk(listing.addressId);
        if (address) {
            yield address.update({ streetName, streetNo, cityId });
        }
        // Update Listing
        yield listing.update({
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
                const amenities = yield RoomAmenity_1.default.findAll({ where: { name: roomAmenities } });
                yield listing.setRoomAmenities(amenities);
            }
            else {
                // Clear all room amenities if empty array is provided
                yield listing.setRoomAmenities([]);
            }
        }
        if (propertyAmenities && Array.isArray(propertyAmenities)) {
            if (propertyAmenities.length > 0) {
                const amenities = yield PropertyAmenity_1.default.findAll({ where: { name: propertyAmenities } });
                yield listing.setPropertyAmenities(amenities);
            }
            else {
                // Clear all property amenities if empty array is provided
                yield listing.setPropertyAmenities([]);
            }
        }
        if (houseRules && Array.isArray(houseRules)) {
            if (houseRules.length > 0) {
                const rules = yield HouseRule_1.default.findAll({ where: { name: houseRules } });
                yield listing.setHouseRules(rules);
            }
            else {
                // Clear all house rules if empty array is provided
                yield listing.setHouseRules([]);
            }
        }
        // Add new photos if provided
        if (photos && Array.isArray(photos) && photos.length > 0) {
            console.log("Adding new photos to listing:", photos);
            // Get the current highest order
            const currentPhotos = yield Photo_1.default.findAll({
                where: { listingId: listing.listingId },
                order: [['order', 'DESC']],
                limit: 1
            });
            const nextOrder = currentPhotos.length > 0 ? (currentPhotos[0].order || 0) + 1 : 0;
            for (let i = 0; i < photos.length; i++) {
                const url = photos[i];
                yield Photo_1.default.create({
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
            yield Photo_1.default.destroy({ where: { listingId: listing.listingId } });
            // Add the new photo list with proper order
            for (let i = 0; i < req.body.updatedPhotos.length; i++) {
                const url = req.body.updatedPhotos[i];
                yield Photo_1.default.create({
                    listingId: listing.listingId,
                    url,
                    order: i
                });
                console.log("Updated photo:", url, "with order:", i);
            }
        }
        return res.json({ message: "Listing updated successfully", listingId: listing.listingId });
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return res.status(500).json({ error: "Failed to update listing" });
    }
});
exports.updateListing = updateListing;
