// const Sequelize = require('sequelize');
const { Model, DataTypes ,Sequelize } = require('sequelize');
const { users_data } = require('./make_dummy.js');

const sequelize = new Sequelize('webservice', 'root', '1234', {
    host: 'localhost',
    dialect:'mysql',
    
  });
  

class User extends Model {}

User.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pwd: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age:{
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    sequelize,
    modelName: 'User' // 테이블 이름 지정
});




module.exports = {User, sequelize};

