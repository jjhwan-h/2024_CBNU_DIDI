import {Sequelize} from 'sequelize'
import {development, test, production} from '../configs/config';
import User from './user';
import Room from './room';
import Candidate from './candidate';
import Email from './email';
import VC from './userRoom';
import UserRoom from './userRoom';
//const env = process.env.NODE_ENV as 'production' || 'test' || 'development';
const config = development
export const sequelize = new Sequelize(config.database!,config.username!, config.password,config);

User.initiate(sequelize);
Room.initiate(sequelize);
Candidate.initiate(sequelize);
Email.initiate(sequelize);
UserRoom.initiate(sequelize);

Room.associate();
Candidate.associate();
User.associate();

