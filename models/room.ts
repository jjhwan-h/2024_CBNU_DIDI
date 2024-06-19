import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, BelongsToManyGetAssociationsMixin} from "sequelize";
import Voter from "./voter";
import Candidate from "./candidate";

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
    declare s_date:Date;
    declare e_date:Date;

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
                allowNull: false,
            },
            desc:{
                type:Sequelize.STRING(100),
                allowNull:false,
            },
            img:{
                type:Sequelize.STRING(200),
                allowNull:true,
            },
            s_date:{
                type:Sequelize.DATE,
                allowNull:false,
            },
            e_date:{
                type:Sequelize.DATE,
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
        Room.hasMany(Voter,{ // 유권자
            foreignKey:'RoomId',sourceKey:'id'
        });
        Room.hasMany(Candidate,{
            foreignKey:'RoomId',sourceKey:'id'
        })
    }
}