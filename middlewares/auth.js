const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/errors/401-Unauthorized');

// eslint-disable-next-line consistent-return
const authMiddleware = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return next(UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};

module.exports = authMiddleware;
