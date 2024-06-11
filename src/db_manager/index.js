// const Sequelize = require('sequelize');
const { Model, DataTypes ,Sequelize } = require('sequelize');

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
    }
  }, {
    sequelize,
    modelName: 'User' // 테이블 이름 지정
});



const connectTestDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB연결 성공');
    await User.sync();
  } catch (error) {
    console.error('DB연결 실패', error);
  }
  await sequelize.close();
  console.log('DB연결 종료');
}


connectTestDb();