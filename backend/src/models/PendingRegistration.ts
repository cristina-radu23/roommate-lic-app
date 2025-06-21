import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class PendingRegistration extends Model {
  public id!: number;
  public userFirstName!: string;
  public userLastName!: string;
  public email!: string;
  public phoneNumber!: string;
  public dateOfBirth!: string;
  public gender!: string;
  public occupation!: string;
  public passwordHash!: string;
  public emailVerificationCode!: string;
  public emailVerificationExpires!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PendingRegistration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userLastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailVerificationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'pending_registrations',
    timestamps: true,
  }
);

export default PendingRegistration; 