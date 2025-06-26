import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface ChatRoomAttributes {
  chatRoomId: number;
  listingId: number;
  isMatchmaking: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatRoomCreationAttributes extends Optional<ChatRoomAttributes, "chatRoomId" | "createdAt" | "updatedAt"> {}

class ChatRoom extends Model<ChatRoomAttributes, ChatRoomCreationAttributes> implements ChatRoomAttributes {
  public chatRoomId!: number;
  public listingId!: number;
  public isMatchmaking!: boolean;
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
    isMatchmaking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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