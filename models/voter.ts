import Room from "./room";
import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, BelongsToManyAddAssociationMixin, ForeignKey} from "sequelize";

export default class Voter extends Model<InferAttributes<Voter>, InferCreationAttributes<Voter>>
{
    declare id: CreationOptional<number>;
    declare name : string;
    declare email:string;
    declare tel:string;
    
    declare RoomId:ForeignKey<Room['id']>;

    static initiate(sequelize: Sequelize.Sequelize){
        Voter.init({
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
                type: Sequelize.STRING(20),
                allowNull:false,
                unique:true,
            },
            tel:{
                type:Sequelize.STRING(100),
                allowNull:false,
                unique:true,
            }
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Voter',
            tableName: 'voter',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        Voter.belongsTo(Room,{  
            foreignKey:'RoomId',
            targetKey:'id'
        })
    }
}