const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('mongoose').Error;
const User = require('../models/user');
const BadRequestError = require('../utils/errors/400-BadRequest');
// const UnauthorizedError = require('../utils/errors/401-Unauthorized');
const ForbiddenError = require('../utils/errors/403-Forbidden');
const NotFoundError = require('../utils/errors/404-NotFound');

const ConflictRequestError = require('../utils/errors/409-ConflictRequest');

const {
  // STATUS_CREATED,
  // STATUS_BAD_REQ,
  // STATUS_CONFLICT,
  // STATUS_SERVER_ERROR,
  // MSG_SERVER_ERROR,
  // STATUS_NOT_FOUND,
  // MSG_NOT_FOUND,
  // MSG_BAD_REQ,
  ERROR_INVALID_ID,
} = require('../utils/globalVars');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name, about, avatar, email, password: hashedPassword,
      })
        .then((newUser) => res.status(201).send({ data: newUser }))
        .catch((err) => {
          if (err instanceof ValidationError) {
            next(new BadRequestError(err.message));
          } else if (err.code === 11000) {
            next(new ConflictRequestError('Такой пользователь уже существует'));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => next(err));
};

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((userList) => res.send({ data: userList }))
    .catch((err) => next(err));
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('Пользователь с таким ID не найден'))
    .then((foundUser) => res.send({ data: foundUser }))
    .catch((err) => next(err));
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь с таким ID не найден'))
    .then((foundUser) => res.send({ data: foundUser }))
    .catch((err) => next(err));
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.params.userId;

  if (req.user._id !== userId) {
    return next(new ForbiddenError('Вы не можете редактировать профиль другого пользователя'));
  }

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь с таким ID не найден'))
    .then((updatedUser) => {
      if (updatedUser) {
        res.send({ data: updatedUser });
      } else {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch((err) => next(err));
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.params.userId;

  if (req.user._id !== userId) {
    return next(new ForbiddenError('Вы не можете изменять аватар другого пользователя'));
  }

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(new NotFoundError(ERROR_INVALID_ID))
    .then((newAvatar) => res.send({ data: newAvatar }))
    .catch((err) => next(err));
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true });
      res.send({ token });
    })
    .catch((err) => next(err));
  // ошибка аутентификации
  // res.status(401).send({ message: err.message });
  // next(err);
  // });
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserAvatar,
  login,
};
