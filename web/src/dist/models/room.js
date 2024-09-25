"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importStar(require("sequelize"));
const candidate_1 = __importDefault(require("./candidate"));
const vc_1 = __importDefault(require("./vc"));
const userRoom_1 = __importDefault(require("./userRoom"));
var RoomCategory;
(function (RoomCategory) {
    RoomCategory["RESIDENT"] = "\uC8FC\uBBFC\uD22C\uD45C";
    RoomCategory["POPULARITY"] = "\uC778\uAE30\uD22C\uD45C";
    RoomCategory["PNC"] = "\uCC2C\uBC18\uD22C\uD45C";
})(RoomCategory || (RoomCategory = {}));
class Room extends sequelize_1.Model {
    static initiate(sequelize) {
        Room.init({
            id: {
                type: sequelize_1.default.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: sequelize_1.default.STRING(20),
                allowNull: false,
            },
            category: {
                type: sequelize_1.default.ENUM(...Object.values(RoomCategory)),
                allowNull: true,
            },
            desc: {
                type: sequelize_1.default.STRING(100),
                allowNull: false,
            },
            img: {
                type: sequelize_1.default.STRING(200),
                allowNull: true,
            },
            sDate: {
                type: sequelize_1.default.DATE,
                allowNull: false,
            },
            eDate: {
                type: sequelize_1.default.DATE,
                allowNull: false,
            },
            creator: {
                type: sequelize_1.default.INTEGER,
                allowNull: false,
            },
            voterCount: {
                type: sequelize_1.default.INTEGER,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Room',
            tableName: 'room',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate() {
        Room.hasMany(candidate_1.default, {
            foreignKey: "RoomId", sourceKey: "id"
        });
        Room.belongsToMany(Room, { through: userRoom_1.default, as: "vote" });
        Room.hasMany(vc_1.default, {
            foreignKey: "RoomId", sourceKey: "id"
        });
    }
}
exports.default = Room;
