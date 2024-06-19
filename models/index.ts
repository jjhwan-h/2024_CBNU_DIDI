import {Sequelize} from 'sequelize'
import {development, test, production} from '../configs/config';
import Voter from './voter';
import Room from './room';
import Candidate from './candidate';
import Email from './email';
//const env = process.env.NODE_ENV as 'production' || 'test' || 'development';
const config = development
export const sequelize = new Sequelize(config.database!,config.username!, config.password,config);

Voter.initiate(sequelize);
Room.initiate(sequelize);
Candidate.initiate(sequelize);
Email.initiate(sequelize);

Voter.associate();
Room.associate();
Candidate.associate();
