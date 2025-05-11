import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface ChatRoomUserAttributes {
  chatRoomUserId: number;
  chatRoomId: number;
  userId: number;
  hasConsented: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatRoomUserCreationAttributes extends Optional<ChatRoomUserAttributes, "chatRoomUserId" | "createdAt" | "updatedAt"> {}

class ChatRoomUser extends Model<ChatRoomUserAttributes, ChatRoomUserCreationAttributes> implements ChatRoomUserAttributes {
  public chatRoomUserId!: number;
  public chatRoomId!: number;
  public userId!: number;
  public hasConsented!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatRoomUser.init(
  {
    chatRoomUserId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatRoomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hasConsented: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "ChatRoomUser",
    tableName: "chat_room_users",
    timestamps: true,
  }
);

export default ChatRoomUser; 