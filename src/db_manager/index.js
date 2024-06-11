const Sequelize = require('sequelize');

const sequelize = new Sequelize('webservice', 'root', '1234', {
    host: 'localhost',
    dialect:'mysql',
    
  });

const connectTestDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB연결 성공');
  } catch (error) {
    console.error('DB연결 실패', error);
  }
  await sequelize.close();
  console.log('DB연결 종료');
}


connectTestDb();