"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listingController_1 = require("../controllers/listingController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
// Adapter to match Express RequestHandler
router.post("/", authMiddleware_1.default, (req, res) => {
    void (0, listingController_1.createListing)(req, res);
});
router.get("/", listingController_1.getAllListings);
router.get("/by-city/:cityId", listingController_1.getListingsByCity);
router.get("/:id", (req, res) => { void (0, listingController_1.getListingById)(req, res); });
router.get("/user/listings", authMiddleware_1.default, (req, res) => { void (0, listingController_1.getUserListings)(req, res); });
// Add this endpoint for photo upload
router.post('/upload-photo', upload_1.default.single('photo'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});
router.put("/:listingId", authMiddleware_1.default, (req, res) => { void (0, listingController_1.updateListing)(req, res); });
router.delete("/:listingId", authMiddleware_1.default, (req, res) => { void (0, listingController_1.deleteListing)(req, res); });
exports.default = router;
