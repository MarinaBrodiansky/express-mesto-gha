const { celebrate, Joi } = require('celebrate');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit'); // limiter
const helmet = require('helmet');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const { login } = require('./controllers/users');
const { createUser } = require('./controllers/users');
// const { MSG_NOT_FOUND } = require('./utils/globalVars');
const NotFoundError = require('./utils/errors/404-NotFound');

const { PORT = 3000 } = process.env;
const { MONGO_DB = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

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
app.use(cookieParser());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:;/~+#-]*[\w@?^=%&/~+#-])?$/),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res, next) => next(new NotFoundError('Не найдено')));

app.use(errors());
app.use(errorHandler);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log('Server started on port:', PORT));
