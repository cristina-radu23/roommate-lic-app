import sequelize from "./config/db";
import "./models/associations"; // make sure all models + associations are imported here
import County from "./models/County";

// Only needed once to populate counties
const seedCounties = async () => {
  const counties = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila",
    "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița",
    "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov",
    "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu",
    "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea", "Vrancea"
  ];

  for (const name of counties) {
    await County.findOrCreate({ where: { countyName: name } });
  }

  console.log("✅ Counties seeded.");
};

const initialize = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected.");

    await sequelize.sync({ alter: true }); // or { force: true } to drop & recreate
    console.log("✅ DB synced.");

    await seedCounties();
  } catch (error) {
    console.error("❌ Initialization failed:", error);
  }
};

initialize();
