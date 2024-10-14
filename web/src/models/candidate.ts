import Room from "./room";
import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey} from "sequelize";

enum genderCategory{
    MALE="남",
    FEMALE="여"    
}
export default class Candidate extends Model<InferAttributes<Candidate>, InferCreationAttributes<Candidate>>
{
    declare id: CreationOptional<number>;
    declare num: number;
    declare name:string;
    declare gender:string;
    declare age:string;
    declare img:string;
    declare desc:string;
    declare count:number;
    declare RoomId:ForeignKey<Room['id']>;
    
    static initiate(sequelize: Sequelize.Sequelize){
        Candidate.init({
            id:{
                type: Sequelize.INTEGER,
                primaryKey:true,
                autoIncrement:true,
            },
            num:{
                type:Sequelize.INTEGER,
                allowNull:false,
            },
            name:{
                type: Sequelize.STRING(20),
                allowNull:false,
            },
            gender:{
                type:Sequelize.ENUM(...Object.values(genderCategory)),
                allowNull:false,
            },
            age:{
                type:Sequelize.STRING(20),
                allowNull:false,
            },
            img:{
                type:Sequelize.STRING(200),
                allowNull:true
            },
            desc:{
                type:Sequelize.STRING(800),
                allowNull:false,
            },
            count:{
                type:Sequelize.INTEGER,
                allowNull:false,
                defaultValue:0
            }
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Candidate',
            tableName: 'candidate',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        Candidate.belongsTo(Room,{
            foreignKey:'RoomId',
            targetKey:'id'
        })
    }
}
