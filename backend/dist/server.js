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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const db_1 = __importDefault(require("./config/db"));
const sequelize_1 = require("sequelize");
require("./models");
const PendingRegistration_1 = __importDefault(require("./models/PendingRegistration"));
const socketService_1 = require("./services/socketService");
// Load all models and associations
require("./models/index");
const County_1 = __importDefault(require("./models/County"));
const City_1 = __importDefault(require("./models/City"));
const city_1 = __importDefault(require("./routes/city"));
const RoomAmenity_1 = __importDefault(require("./models/RoomAmenity"));
const PropertyAmenity_1 = __importDefault(require("./models/PropertyAmenity"));
const HouseRule_1 = __importDefault(require("./models/HouseRule"));
const listing_1 = __importDefault(require("./routes/listing"));
const user_1 = __importDefault(require("./routes/user"));
const chat_1 = __importDefault(require("./routes/chat"));
const likes_1 = __importDefault(require("./routes/likes"));
const match_1 = __importDefault(require("./routes/match"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
// Only a few cities shown for brevity — add the full list
const cities = [
    { countyId: "CJ", cityName: "Cluj-Napoca" },
    { countyId: "CJ", cityName: "Turda" },
    { countyId: "CJ", cityName: "Dej" },
    { countyId: "CT", cityName: "Constanța" },
    { countyId: "B", cityName: "București" },
    { countyId: "TM", cityName: "Timișoara" },
    { countyId: "IS", cityName: "Iași" },
    { countyId: "BR", cityName: "Brăila" },
    { countyId: "BV", cityName: "Brașov" },
    { countyId: "AR", cityName: "Arad" },
    // 🔁 Add more here
];
const seedCities = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const { countyId, cityName } of cities) {
        yield City_1.default.findOrCreate({
            where: { countyId, cityName },
        });
    }
    console.log("✅ Cities seeded");
});
const seedAmenities = () => __awaiter(void 0, void 0, void 0, function* () {
    const roomAmenities = [
        "Furnished",
        "Private Bathroom",
        "Balcony",
        "Air Conditioner"
    ];
    for (const name of roomAmenities) {
        yield RoomAmenity_1.default.findOrCreate({ where: { name } });
    }
    const propertyAmenities = [
        "TV",
        "WiFi",
        "Air Conditioning",
        "Parking",
        "Heating",
        "Washing Machine",
        "Elevator",
        "Furnished",
        "Garden",
        "Terrace"
    ];
    for (const name of propertyAmenities) {
        yield PropertyAmenity_1.default.findOrCreate({ where: { name } });
    }
    const houseRules = [
        "Pet friendly",
        "Smoker friendly"
    ];
    for (const name of houseRules) {
        yield HouseRule_1.default.findOrCreate({ where: { name } });
    }
    console.log("✅ Amenities seeded");
});
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Backend is running!");
});
app.use("/uploads", express_1.default.static("uploads"));
app.use("/api/cities", city_1.default);
app.use("/api/listings", listing_1.default);
app.use("/api/users", user_1.default); // and userRoutes defines POST /register
app.use("/api/chat", chat_1.default);
app.use("/api/likes", likes_1.default);
app.use("/api/match", match_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
// ✅ County seeding function
const seedCounties = () => __awaiter(void 0, void 0, void 0, function* () {
    const counties = {
        AB: "Alba",
        AR: "Arad",
        AG: "Argeș",
        BC: "Bacău",
        BH: "Bihor",
        BN: "Bistrița-Năsăud",
        BT: "Botoșani",
        BV: "Brașov",
        BR: "Brăila",
        B: "București",
        BZ: "Buzău",
        CL: "Călărași",
        CS: "Caraș-Severin",
        CJ: "Cluj",
        CT: "Constanța",
        CV: "Covasna",
        DB: "Dâmbovița",
        DJ: "Dolj",
        GL: "Galați",
        GR: "Giurgiu",
        GJ: "Gorj",
        HR: "Harghita",
        HD: "Hunedoara",
        IL: "Ialomița",
        IS: "Iași",
        IF: "Ilfov",
        MM: "Maramureș",
        MH: "Mehedinți",
        MS: "Mureș",
        NT: "Neamț",
        OT: "Olt",
        PH: "Prahova",
        SM: "Satu Mare",
        SJ: "Sălaj",
        SB: "Sibiu",
        SV: "Suceava",
        TR: "Teleorman",
        TM: "Timiș",
        TL: "Tulcea",
        VS: "Vaslui",
        VL: "Vâlcea",
        VN: "Vrancea",
    };
    for (const [code, name] of Object.entries(counties)) {
        yield County_1.default.findOrCreate({ where: { countyId: code, countyName: name } });
    }
    console.log("✅ Counties seeded");
});
// Cleanup expired pending registrations
const cleanupExpiredRegistrations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expiredCount = yield PendingRegistration_1.default.destroy({
            where: {
                emailVerificationExpires: {
                    [sequelize_1.Op.lt]: new Date()
                }
            }
        });
        if (expiredCount > 0) {
            console.log(`🧹 Cleaned up ${expiredCount} expired pending registrations`);
        }
    }
    catch (error) {
        console.error('Error cleaning up expired registrations:', error);
    }
});
// ✅ Initialize DB and start server
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.authenticate();
        console.log("✅ Database connected");
        yield db_1.default.sync( /* {force:true} */); // Safe syncing
        yield seedCounties(); // Insert counties if not already
        yield seedCities();
        yield seedAmenities();
        yield cleanupExpiredRegistrations(); // Clean up expired registrations
        // Create HTTP server
        const httpServer = (0, http_1.createServer)(app);
        // Initialize WebSocket service
        const socketService = new socketService_1.SocketService(httpServer);
        console.log("✅ WebSocket service initialized");
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔌 WebSocket server ready`);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
    }
});
startServer();
