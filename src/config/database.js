import { Sequelize } from "sequelize"
const sequelize = new Sequelize('test', 'postgres', String(process.env.DBPASSWORD) || 'postgres',{
    dialect: 'postgres',
    host: 'localhost',
    logging: false
});

export default sequelize
