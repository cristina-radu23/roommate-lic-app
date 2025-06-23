"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ChatRoom extends sequelize_1.Model {
}
ChatRoom.init({
    chatRoomId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    listingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    isMatchmaking: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "ChatRoom",
    tableName: "chat_rooms",
    timestamps: true,
});
exports.default = ChatRoom;
