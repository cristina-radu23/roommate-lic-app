"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ChatRoomUser extends sequelize_1.Model {
}
ChatRoomUser.init({
    chatRoomUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    chatRoomId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    hasConsented: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isChatVisible: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "ChatRoomUser",
    tableName: "chat_room_users",
    timestamps: true,
});
exports.default = ChatRoomUser;
