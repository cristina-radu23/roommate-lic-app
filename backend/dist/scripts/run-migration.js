"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const add_user_fields_1 = require("../migrations/add-user-fields");
const db_1 = __importDefault(require("../config/db"));
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, add_user_fields_1.up)(db_1.default.getQueryInterface());
            console.log('Migration completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    });
}
runMigration();
