import Room from "./room";
import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, DataTypes, ForeignKey, ENUM} from "sequelize";

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>>
{
    declare id: CreationOptional<number>;
    declare name : string;
    declare email:string;
    declare password:string | null;
    declare status:string;
    
    declare RoomId:ForeignKey<Room['id']>;

    static initiate(sequelize: Sequelize.Sequelize){
        User.init({
            id:{
                type: Sequelize.INTEGER,
                primaryKey:true,
                autoIncrement:true,
            },
            name:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            email:{
                type: Sequelize.STRING,
                allowNull:false,
            },
            password:{
                type: Sequelize.STRING,
                allowNull:true,
            },
            status: {
                type: Sequelize.ENUM('preUser', 'user'),
                allowNull: false,
                defaultValue: 'preUser',
              },
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'user',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        User.belongsTo(Room,{  
            foreignKey:'RoomId',
            targetKey:'id'
        })
    }
}