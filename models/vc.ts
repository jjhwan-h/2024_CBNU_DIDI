import Room from "./room";
import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, DataTypes, ForeignKey,BelongsToManyGetAssociationsMixin} from "sequelize";

export default class Vc extends Model<InferAttributes<Vc>, InferCreationAttributes<Vc>>
{
    declare id: CreationOptional<number>;
    declare isUsed : boolean;

    declare RoomId:ForeignKey<Room['id']>;

    static initiate(sequelize: Sequelize.Sequelize){
        Vc.init({
            id:{
                type: Sequelize.INTEGER,
                primaryKey:true,
                autoIncrement:true,
            },
            isUsed:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
            }
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Vc',
            tableName: 'vc',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        Vc.belongsTo(Room,{
            foreignKey:'RoomId',
            targetKey:'id'
        });
    }
}