import  Sequelize,{Model, CreationOptional, InferAttributes, InferCreationAttributes, BelongsToManyAddAssociationMixin, ForeignKey} from "sequelize";
import User from "./user";
import Room from "./room";

export default class UserRoom extends Model<InferAttributes<UserRoom>, InferCreationAttributes<UserRoom>>
{
    declare id: CreationOptional<number>;
    declare isIssued: boolean;

    declare RoomId:ForeignKey<Room['id']>;
    declare UserId:ForeignKey<User['id']>;

    static initiate(sequelize: Sequelize.Sequelize){
        UserRoom.init({
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
            modelName: 'UserRoom',
            tableName: 'userRoom',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes:[
                {
                    unique: true,
                    fields: ['UserId', 'RoomId']
                  }
            ]
        })
    }
}