const path = require('path');
// Express 모듈을 불러옵니다.
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const exp = require('constants');
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'your_secret_key';





// Express 애플리케이션을 생성합니다.
const app = express();



// 로깅 미들웨어
const logginMiddleware =(req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // 다음 미들웨어로 요청을 전달
};

//세션인증 미들웨어
const sessionAuthMiddleware = (req, res, next) => {
  console.log(req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('인증되지 않은 사용자입니다.');
  }
};

//토큰인증 미들웨어
const tokenAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];

  if (!authHeader || !token) {
    return res.status(403).send('비정상 접근입니다.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    console.log(err);
    return res.status(401).send('정상적이지 않은 토큰입니다.');
  }
  next();
};







// 기본 포트를 설정하거나 3000 포트를 사용합니다.
const PORT = process.env.PORT || 3000;

app.use('/static', express.static(path.join(__dirname,'public')));

app.use(session({
  secret: 'this_is_secret_this_is_secret_this_is_secret_',
  resave: false,
  saveUninitialized: false,
}));
app.use(bodyParser.json()) // application/json 문서타입을 파싱하기 위함
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
  } else {
      next();
  }
});


const users = [
  {id: "hong", name: '홍길동', pwd: '1234'},
  {id: "kim", name: '김길동', pwd: '1234'},
  {id: "so", name: '소길동', pwd: '1234'},
  {id: "na", name: '나길동', pwd: '1234'},
];

//토큰기반 로그인
app.post('/token/login', (req, res) => {
  const { id, pwd } = req.body;
  
  
  const user = users.find(user => user.id === id && user.pwd === pwd);
  if (user) {
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ token , user:user.name });
  } else {
    res.status(401).send('로그인 실패');
  }
});







// 루트 경로 ('/')에 대한 GET 요청을 처리합니다.
app.get('/', (req, res) => {
  res.send(`Hello, ${req.user.name}`);
});


//토큰 인증 사용
app.get('/user',tokenAuthMiddleware, (req, res) => {  
  const {id} = req.query;
  
  if(id) {
    const resultUser = users.find((userData) =>{
      return userData.id === id
    });

    if(resultUser){
      return res.send(resultUser);
    }else{
      return res.status(400).send("해당 사용자를 찾을 수 없습니다.");
    }
  }else {
    return res.send(users)
  }
});



app.post('/user', (req, res) => {
  const { id, name, pwd } = req.body;

  if(pwd.length < 8){
    console.log(pwd)
    return res.status(400).send("비밀번호가 너무 짧습니다. (최소 8자)");
  }

  const existingUser = users.find(user => user.id === id);

  if(existingUser){
    console.log("이미 존재하는 아이디입니다.",id);
    return res.status(400).send("이미 존재하는 아이디입니다.");
  }
  users.push({id,name,pwd});
  console.log(req.body);
  res.send("새로운 유저가 추가되었습니다.");
});


app.put('/user', (req, res) => {
  const { id, pwd, name } = req.body;
  const existingUser = users.find(user => user.id === id);
  if (pwd && pwd.length < 8) {
    return res.status(400).send("비밀번호는 최소 8자리 이상이어야 합니다.")
  }
  if (existingUser){
      console.log("바꾸기 전 비밀번호");
      console.log(existingUser.pwd);

      existingUser.pwd = pwd;
      console.log("바뀐 비밀번호");
      console.log(existingUser.pwd);
      
      existingUser.name = name;
      console.log("바꾸기전 이름",existingUser.name);
      console.log("바뀐 이름",existingUser.name);
      res.send("사용자 정보를 성공적으로 업데이트 했습니다.")
  }else{
    res.send("없는 유저입니다. 등록을 먼저 해주세요.");
    console.log("없는 유저입니다. 등록을 먼저 해주세요.");
  }
  

});



app.delete('/user', (req, res) => {
  const { id } = req.body;
  const existingUser = users.find(user => user.id === id);
  if (existingUser){
    console.log(existingUser,"의 정보를 삭제합니다.")
    existingUser.splice(existingUser,1);
    res.send("성공적으로 사용자 정보를 삭제했습니다");
  }else{
    console.log("존재하지 않는 사용자입니다.");
  }

});


app.post('/session/login',logginMiddleware, (req, res) => { 
  const { id, pwd } = req.body;
  const user = users.find(user => user.id === id && user.pwd === pwd);

  if (user) {
    req.session.user = {id: user.id, name: user.name};
    res.send('로그인 성공');
  } else {
    res.status(401).send('로그인 실패');
  }
});

app.get('/session/logout',logginMiddleware, (req, res) => {
  req.session.destroy();
  res.send('로그아웃 성공');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
