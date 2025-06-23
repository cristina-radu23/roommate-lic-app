"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRegistration = exports.Notification = exports.Match = exports.Like = exports.Message = exports.ChatRoomUser = exports.ChatRoom = exports.HouseRule = exports.PropertyAmenity = exports.RoomAmenity = exports.Photo = exports.County = exports.City = exports.Address = exports.Listing = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Listing_1 = __importDefault(require("./Listing"));
exports.Listing = Listing_1.default;
const Address_1 = __importDefault(require("./Address"));
exports.Address = Address_1.default;
const City_1 = __importDefault(require("./City"));
exports.City = City_1.default;
const County_1 = __importDefault(require("./County"));
exports.County = County_1.default;
const Photo_1 = __importDefault(require("./Photo"));
exports.Photo = Photo_1.default;
const RoomAmenity_1 = __importDefault(require("./RoomAmenity"));
exports.RoomAmenity = RoomAmenity_1.default;
const PropertyAmenity_1 = __importDefault(require("./PropertyAmenity"));
exports.PropertyAmenity = PropertyAmenity_1.default;
const HouseRule_1 = __importDefault(require("./HouseRule"));
exports.HouseRule = HouseRule_1.default;
const ChatRoom_1 = __importDefault(require("./ChatRoom"));
exports.ChatRoom = ChatRoom_1.default;
const ChatRoomUser_1 = __importDefault(require("./ChatRoomUser"));
exports.ChatRoomUser = ChatRoomUser_1.default;
const Message_1 = __importDefault(require("./Message"));
exports.Message = Message_1.default;
const Like_1 = __importDefault(require("./Like"));
exports.Like = Like_1.default;
const Match_1 = __importDefault(require("./Match"));
exports.Match = Match_1.default;
const Notification_1 = __importDefault(require("./Notification"));
exports.Notification = Notification_1.default;
const PendingRegistration_1 = __importDefault(require("./PendingRegistration"));
exports.PendingRegistration = PendingRegistration_1.default;
// =======================
// One-to-Many Associations
// =======================
// User ↔ Listing
User_1.default.hasMany(Listing_1.default, { foreignKey: "userId" });
Listing_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
// Address ↔ Listing
Address_1.default.hasMany(Listing_1.default, { foreignKey: "addressId" });
Listing_1.default.belongsTo(Address_1.default, { foreignKey: "addressId" });
// City ↔ Address
City_1.default.hasMany(Address_1.default, { foreignKey: "cityId" });
Address_1.default.belongsTo(City_1.default, { foreignKey: "cityId" });
// County ↔ City
County_1.default.hasMany(City_1.default, { foreignKey: "countyId" });
City_1.default.belongsTo(County_1.default, { foreignKey: "countyId" });
// Listing ↔ Photo
Listing_1.default.hasMany(Photo_1.default, { foreignKey: "listingId", onDelete: "CASCADE" });
Photo_1.default.belongsTo(Listing_1.default, { foreignKey: "listingId" });
// =======================
// Many-to-Many Associations
// =======================
// Listing ↔ RoomAmenity
Listing_1.default.belongsToMany(RoomAmenity_1.default, { through: "ListingRoomAmenities" });
RoomAmenity_1.default.belongsToMany(Listing_1.default, { through: "ListingRoomAmenities" });
// Listing ↔ PropertyAmenity
Listing_1.default.belongsToMany(PropertyAmenity_1.default, { through: "ListingPropertyAmenities" });
PropertyAmenity_1.default.belongsToMany(Listing_1.default, { through: "ListingPropertyAmenities" });
// Listing ↔ HouseRule
Listing_1.default.belongsToMany(HouseRule_1.default, { through: "ListingHouseRules" });
HouseRule_1.default.belongsToMany(Listing_1.default, { through: "ListingHouseRules" });
// ChatRoom ↔ Listing
ChatRoom_1.default.belongsTo(Listing_1.default, { foreignKey: "listingId" });
Listing_1.default.hasMany(ChatRoom_1.default, { foreignKey: "listingId" });
// ChatRoom ↔ Message
ChatRoom_1.default.hasMany(Message_1.default, { foreignKey: "chatRoomId", onDelete: "CASCADE" });
Message_1.default.belongsTo(ChatRoom_1.default, { foreignKey: "chatRoomId" });
// ChatRoomUser ↔ ChatRoom
ChatRoomUser_1.default.belongsTo(ChatRoom_1.default, { foreignKey: "chatRoomId" });
ChatRoom_1.default.hasMany(ChatRoomUser_1.default, { foreignKey: "chatRoomId" });
// ChatRoomUser ↔ User
ChatRoomUser_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
User_1.default.hasMany(ChatRoomUser_1.default, { foreignKey: "userId" });
// Message ↔ User
Message_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
User_1.default.hasMany(Message_1.default, { foreignKey: "userId" });
// Like ↔ User
Like_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
User_1.default.hasMany(Like_1.default, { foreignKey: "userId" });
// Like ↔ Listing
Like_1.default.belongsTo(Listing_1.default, { foreignKey: "listingId" });
Listing_1.default.hasMany(Like_1.default, { foreignKey: "listingId" });
Listing_1.default.belongsTo(Address_1.default, { foreignKey: "addressId" });
Address_1.default.hasMany(Listing_1.default, { foreignKey: "addressId" });
Address_1.default.belongsTo(City_1.default, { foreignKey: "cityId" });
City_1.default.hasMany(Address_1.default, { foreignKey: "cityId" });
// Add associations if needed
Match_1.default.belongsTo(User_1.default, { as: 'UserA', foreignKey: 'userAId' });
Match_1.default.belongsTo(User_1.default, { as: 'UserB', foreignKey: 'userBId' });
Match_1.default.belongsTo(Listing_1.default, { foreignKey: 'listingId' });
// User ↔ Notification
User_1.default.hasMany(Notification_1.default, { foreignKey: "userId" });
Notification_1.default.belongsTo(User_1.default, { foreignKey: "userId" });
