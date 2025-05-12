import User from "./User";
import Listing from "./Listing";
import Address from "./Address";
import City from "./City";
import County from "./County";
import Photo from "./Photo";
import RoomAmenity from "./RoomAmenity";
import PropertyAmenity from "./PropertyAmenity";
import HouseRule from "./HouseRule";
import ChatRoom from "./ChatRoom";
import ChatRoomUser from "./ChatRoomUser";
import Message from "./Message";
import Like from "./Like";
import Match from "./Match";

// =======================
// One-to-Many Associations
// =======================

// User ↔ Listing
User.hasMany(Listing, { foreignKey: "userId" });
Listing.belongsTo(User, { foreignKey: "userId" });

// Address ↔ Listing
Address.hasMany(Listing, { foreignKey: "addressId" });
Listing.belongsTo(Address, { foreignKey: "addressId" });

// City ↔ Address
City.hasMany(Address, { foreignKey: "cityId" });
Address.belongsTo(City, { foreignKey: "cityId" });

// County ↔ City
County.hasMany(City, { foreignKey: "countyId" });
City.belongsTo(County, { foreignKey: "countyId" });

// Listing ↔ Photo
Listing.hasMany(Photo, { foreignKey: "listingId", onDelete: "CASCADE" });
Photo.belongsTo(Listing, { foreignKey: "listingId" });

// =======================
// Many-to-Many Associations
// =======================

// Listing ↔ RoomAmenity
Listing.belongsToMany(RoomAmenity, { through: "ListingRoomAmenities" });
RoomAmenity.belongsToMany(Listing, { through: "ListingRoomAmenities" });

// Listing ↔ PropertyAmenity
Listing.belongsToMany(PropertyAmenity, { through: "ListingPropertyAmenities" });
PropertyAmenity.belongsToMany(Listing, { through: "ListingPropertyAmenities" });

// Listing ↔ HouseRule
Listing.belongsToMany(HouseRule, { through: "ListingHouseRules" });
HouseRule.belongsToMany(Listing, { through: "ListingHouseRules" });

// ChatRoom ↔ Listing
ChatRoom.belongsTo(Listing, { foreignKey: "listingId" });
Listing.hasMany(ChatRoom, { foreignKey: "listingId" });

// ChatRoom ↔ Message
ChatRoom.hasMany(Message, { foreignKey: "chatRoomId", onDelete: "CASCADE" });
Message.belongsTo(ChatRoom, { foreignKey: "chatRoomId" });

// ChatRoomUser ↔ ChatRoom
ChatRoomUser.belongsTo(ChatRoom, { foreignKey: "chatRoomId" });
ChatRoom.hasMany(ChatRoomUser, { foreignKey: "chatRoomId" });

// ChatRoomUser ↔ User
ChatRoomUser.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ChatRoomUser, { foreignKey: "userId" });

// Message ↔ User
Message.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Message, { foreignKey: "userId" });

// Like ↔ User
Like.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Like, { foreignKey: "userId" });

// Like ↔ Listing
Like.belongsTo(Listing, { foreignKey: "listingId" });
Listing.hasMany(Like, { foreignKey: "listingId" });

Listing.belongsTo(Address, { foreignKey: "addressId" });
Address.hasMany(Listing, { foreignKey: "addressId" });
Address.belongsTo(City, { foreignKey: "cityId" });
City.hasMany(Address, { foreignKey: "cityId" });

// Add associations if needed
Match.belongsTo(User, { as: 'UserA', foreignKey: 'userAId' });
Match.belongsTo(User, { as: 'UserB', foreignKey: 'userBId' });
Match.belongsTo(Listing, { foreignKey: 'listingId' });

export { User, Listing, Address, City, County, Photo, RoomAmenity, PropertyAmenity, HouseRule, ChatRoom, ChatRoomUser, Message, Like, Match };
