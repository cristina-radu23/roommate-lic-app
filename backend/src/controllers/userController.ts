import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/authMiddleware";


export const createAccount = async (req: Request, res: Response): Promise<void>=> {
  try {
    const {
      userFirstName,
      userLastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      occupation,
      password,
    } = req.body;

    // Check if user already exists with same email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      res.status(400).json({ error: "Email already registered." });
      return;
    }

    // Check if user already exists with same phone number
    const existingUserByPhone = await User.findOne({ where: { phoneNumber } });
    if (existingUserByPhone) {
      res.status(400).json({ error: "Phone number already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userFirstName,
      userLastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      occupation,
      passwordHash,
    });

    res.status(201).json({ message: "Account created successfully", userId: newUser.userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Account creation failed." });
  }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { userId: user.userId, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.json({ token, userId: user.userId });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findByPk(userId, {
      attributes: [
        "userFirstName",
        "userLastName",
        "email",
        "phoneNumber",
        "profilePicture",
        "bio",
        "gender",
        "dateOfBirth",
        "occupation"
      ]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await User.findByPk(userId, {
      attributes: [
        "userFirstName",
        "userLastName",
        "email",
        "phoneNumber",
        "profilePicture",
        "bio"
      ]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};