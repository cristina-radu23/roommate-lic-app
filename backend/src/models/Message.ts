import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface MessageAttributes {
  messageId: number;
  chatRoomId: number;
  userId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, "messageId" | "createdAt" | "updatedAt"> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public messageId!: number;
  public chatRoomId!: number;
  public userId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    messageId: {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: true,
  }
);

export default Message; 