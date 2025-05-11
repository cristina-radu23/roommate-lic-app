import City from "../models/City";
import { Request, Response } from "express";

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await City.findAll({attributes: ['cityId', 'cityName']});
    res.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};
