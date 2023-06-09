const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet'); // https://expressjs.com/ru/advanced/best-practice-security.html
const { LIMITER, MONGO_DB, PORT } = require('./utils/config');
const { MSG_NOT_FOUND } = require('./utils/globalVars');

const app = express();
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_DB);

app.use(LIMITER); // AntiDOS for all requests
app.use(helmet());

// Заглушка авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '64835419ed74038310dbacf9',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res) => {
  res.status(404).send({ message: MSG_NOT_FOUND });
});

app.listen(PORT, () => console.log('Server started on port:', PORT));
