import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface UserAttributes {
  userId: number;
  userFirstName: string;
  userLastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "not specified";
  occupation: "student" | "employeed" | "not specified";
  passwordHash: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "userId"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public userId!: number;
  public userFirstName!: string;
  public userLastName!: string;
  public email!: string;
  public phoneNumber!: string;
  public dateOfBirth!: Date;
  public gender!: "male" | "female" | "not specified";
  public occupation!: "student" | "employeed" | "not specified";
  public passwordHash!: string;
}

User.init(
  {
    userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userFirstName: { type: DataTypes.STRING, allowNull: false },
    userLastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    dateOfBirth: { type: DataTypes.DATE, allowNull: false },
    gender: {
      type: DataTypes.ENUM("male", "female", "not specified"),
      defaultValue: "not specified",
    },
    occupation: {
      type: DataTypes.ENUM("student", "employeed", "not specified"),
      defaultValue: "not specified",
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export default User;
