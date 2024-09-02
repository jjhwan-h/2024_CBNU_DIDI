import  Sequelize,{Model, BelongsToManyGetAssociationsMixin, CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey} from "sequelize";
import User from "./user";
import Candidate from "./candidate";
import Vc from "./vc";
import UserRoom from "./userRoom";

enum RoomCategory{
    RESIDENT="주민투표",
    POPULARITY="인기투표",
    PNC="찬반투표"
}
export default class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>>
{

    declare id: CreationOptional<number>;
    declare name:string;
    declare category:RoomCategory
    declare desc:string;
    declare img:string;
    declare "sDate":Date;
    declare "eDate":Date;
    declare creator:number
    declare voterCount:number

    declare CandidateId:ForeignKey<Candidate['id']>;
    declare UserRoomId:ForeignKey<UserRoom['id']>;

    declare getUsers: BelongsToManyGetAssociationsMixin<User>;

    static initiate(sequelize: Sequelize.Sequelize){
        Room.init({
            id:{
                type: Sequelize.INTEGER,
                primaryKey:true,
                autoIncrement:true,
            },
            name:{
                type: Sequelize.STRING(20),
                allowNull:false,
            },
            category: {
                type: Sequelize.ENUM(...Object.values(RoomCategory)),
                allowNull: true,
            },
            desc:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            img:{
                type:Sequelize.STRING(200),
                allowNull:true,
            },
            sDate:{
                type:Sequelize.DATE,
                allowNull:false,
            },
            eDate:{
                type:Sequelize.DATE,
                allowNull:false,
            },
            creator:{
                type:Sequelize.INTEGER,
                allowNull:false,
            },
            voterCount:{
                type:Sequelize.INTEGER,
                allowNull:false,
            }
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Room',
            tableName: 'room',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        Room.hasMany(Candidate,{
            foreignKey:"RoomId",sourceKey:"id"
        });
        Room.belongsToMany(Room,{through:UserRoom,as:"vote"});
        Room.hasMany(Vc,{
            foreignKey:"RoomId",sourceKey:"id"
        })
    }
}