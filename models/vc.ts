import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, BelongsToManyAddAssociationMixin, ForeignKey} from "sequelize";
import User from "./user";
import Room from "./room";

export default class VC extends Model<InferAttributes<VC>, InferCreationAttributes<VC>>
{
    declare id: CreationOptional<number>;
    declare isIssued: boolean;

    declare RoomId:ForeignKey<Room['id']>;
    declare UserId:ForeignKey<User['id']>;

    static initiate(sequelize: Sequelize.Sequelize){
        VC.init({
            id:{
                type: Sequelize.INTEGER,
                primaryKey:true,
                autoIncrement:true,
            },
            isIssued:{
                type:Sequelize.BOOLEAN,
                defaultValue:false
            }

        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'VC',
            tableName: 'vc',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        })
    }
    static associate(){
        VC.belongsTo(User,{foreignKey:"UserId", targetKey:"id"});
        VC.belongsTo(Room,{foreignKey:"RoomId", targetKey:"id"});
    }
}