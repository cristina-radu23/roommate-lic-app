import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import sequelize from "./config/db";
import { Op } from "sequelize";
import "./models";
import User from "./models/User";
import PendingRegistration from "./models/PendingRegistration";
import { SocketService } from "./services/socketService";

// Load all models and associations

import "./models/index";
import County from "./models/County";

import City from "./models/City";
import cityRoutes from "./routes/city";

import RoomAmenity from "./models/RoomAmenity";
import PropertyAmenity from "./models/PropertyAmenity";
import HouseRule from "./models/HouseRule";

import listingRoutes from "./routes/listing";
import userRoutes from "./routes/user"
import chatRoutes from "./routes/chat";
import likeRoutes from './routes/likes';
import matchRoutes from './routes/match';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from "./routes/notificationRoutes";
import recommendationRoutes from "./routes/recommendations";
import roommateAnnouncementRoutes from "./routes/roommateAnnouncement";
import userProfileRoutes from "./routes/userProfile";
import idealRoommatePreferenceRoutes from "./routes/idealRoommatePreference";

// Only a few cities shown for brevity — add the full list
const cities: { countyId: string; cityName: string }[] = [
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

const seedCities = async () => {
  for (const { countyId, cityName } of cities) {
    await City.findOrCreate({
      where: { countyId, cityName },
    });
  }
  console.log("✅ Cities seeded");
};

const seedAmenities = async () => {
  const roomAmenities = [
    "Furnished",
    "Private Bathroom",
    "Balcony",
    "Air Conditioner"
  ];

  for (const name of roomAmenities) {
    await RoomAmenity.findOrCreate({ where: { name } });
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
    await PropertyAmenity.findOrCreate({ where: { name } });
  }

  const houseRules = [
    "Pet friendly",
    "Smoker friendly"
  ];

  for (const name of houseRules) {
    await HouseRule.findOrCreate({ where: { name } });
  }

  console.log("✅ Amenities seeded");
};


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/uploads", express.static("uploads"));


app.use("/api/cities", cityRoutes);

app.use("/api/listings", listingRoutes);

app.use("/api/users", userRoutes); // and userRoutes defines POST /register

app.use("/api/chat", chatRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/roommate-announcements", roommateAnnouncementRoutes);
app.use("/api/user-profiles", userProfileRoutes);
app.use("/api/ideal-roommate-preferences", idealRoommatePreferenceRoutes);


// ✅ County seeding function
const seedCounties = async () => {
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
    await County.findOrCreate({ where: { countyId: code, countyName: name } });
  }

  console.log("✅ Counties seeded");
};

// Cleanup expired pending registrations
const cleanupExpiredRegistrations = async () => {
  try {
    const expiredCount = await PendingRegistration.destroy({
      where: {
        emailVerificationExpires: {
          [Op.lt]: new Date()
        }
      }
    });
    if (expiredCount > 0) {
      console.log(`🧹 Cleaned up ${expiredCount} expired pending registrations`);
    }
  } catch (error) {
    console.error('Error cleaning up expired registrations:', error);
  }
};

// ✅ Initialize DB and start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync(/* {force:true} */ ); // Safe syncing
    await seedCounties(); // Insert counties if not already
    await seedCities();
    await seedAmenities();
    await cleanupExpiredRegistrations(); // Clean up expired registrations

    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize WebSocket service
    const socketService = new SocketService(httpServer);
    console.log("✅ WebSocket service initialized");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server ready`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
