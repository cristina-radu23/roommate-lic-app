import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type RoomAmenity from "./RoomAmenity";
import type PropertyAmenity from "./PropertyAmenity";
import type HouseRule from "./HouseRule";

interface ListingAttributes {
  listingId: number;
  userId: number;
  addressId: number;

  listingType: "room" | "entire_property";
  propertyType: "apartment" | "house";
  userRole: "owner" | "tenant";

  sizeM2: number;

  bedroomsSingle: number;
  bedroomsDouble: number;

  flatmatesFemale: number;
  flatmatesMale: number;

  availableFrom: Date;
  availableTo?: Date | null;
  openEnded: boolean;

  rent: number;
  deposit?: number | null;
  noDeposit: boolean;

  roomSizeM2?: number | null;
  hasBed: boolean;
  bedType?: "sofa_bed" | "single" | "double" | null;

  title: string;
  description: string;

  createdAt?: Date;
  updatedAt?: Date;
}



interface ListingCreationAttributes extends Optional<ListingAttributes, "listingId" | "availableTo" | "deposit" | "roomSizeM2" | "bedType" | "createdAt" | "updatedAt"> {}

class Listing extends Model<ListingAttributes, ListingCreationAttributes> implements ListingAttributes {

  public setRoomAmenities!: (items: RoomAmenity[] | number[]) => Promise<void>;
  public setPropertyAmenities!: (items: PropertyAmenity[] | number[]) => Promise<void>;
  public setHouseRules!: (items: HouseRule[] | number[]) => Promise<void>;

  public listingId!: number;
  public userId!: number;
  public addressId!: number;

  public listingType!: "room" | "entire_property";
  public propertyType!: "apartment" | "house";
  public userRole!: "owner" | "tenant";

  public sizeM2!: number;

  public bedroomsSingle!: number;
  public bedroomsDouble!: number;

  public flatmatesFemale!: number;
  public flatmatesMale!: number;

  public availableFrom!: Date;
  public availableTo?: Date | null;
  public openEnded!: boolean;

  public rent!: number;
  public deposit?: number | null;
  public noDeposit!: boolean;

  public roomSizeM2?: number | null;
  public hasBed!: boolean;
  public bedType?: "sofa_bed" | "single" | "double" | null;

  public title!: string;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Listing.init(
  {
    listingId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listingType: {
      type: DataTypes.ENUM("room", "entire_property"),
      allowNull: false,
    },
    propertyType: {
      type: DataTypes.ENUM("apartment", "house"),
      allowNull: false,
    },
    userRole: {
      type: DataTypes.ENUM("owner", "tenant"),
      allowNull: false,
    },
    sizeM2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bedroomsSingle: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bedroomsDouble: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    flatmatesFemale: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    flatmatesMale: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    availableTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    openEnded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deposit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    noDeposit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    roomSizeM2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hasBed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bedType: {
      type: DataTypes.ENUM("sofa_bed", "single", "double"),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Listing",
    tableName: "listings",
    timestamps: true,
  }
);

export default Listing;
