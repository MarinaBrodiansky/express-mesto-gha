const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit'); // limiter
const helmet = require('helmet'); // https://expressjs.com/ru/advanced/best-practice-security.html

const { PORT = 3000 } = process.env;
const { MONGO_DB = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const { MSG_NOT_FOUND } = require('./utils/globalVars');

const LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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
