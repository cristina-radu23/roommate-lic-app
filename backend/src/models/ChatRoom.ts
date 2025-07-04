import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface ChatRoomAttributes {
  chatRoomId: number;
  listingId: number | null;
  announcementId?: number | null;
  isMatchmaking: boolean;
  matchId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatRoomCreationAttributes extends Optional<ChatRoomAttributes, "chatRoomId" | "createdAt" | "updatedAt"> {}

class ChatRoom extends Model<ChatRoomAttributes, ChatRoomCreationAttributes> implements ChatRoomAttributes {
  public chatRoomId!: number;
  public listingId!: number | null;
  public announcementId?: number | null;
  public isMatchmaking!: boolean;
  public matchId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatRoom.init(
  {
    chatRoomId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    announcementId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isMatchmaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ChatRoom",
    tableName: "chat_rooms",
    timestamps: true,
  }
);

export default ChatRoom; 