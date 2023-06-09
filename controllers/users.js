const { CastError, ValidationError } = require('mongoose').Error;
const User = require('../models/user');
const {
  STATUS_CREATED,
  STATUS_BAD_REQ,
  STATUS_SERVER_ERROR,
  MSG_SERVER_ERROR,
  STATUS_NOT_FOUND,
  MSG_NOT_FOUND,
  MSG_BAD_REQ,
  ERROR_INVALID_ID,
} = require('../utils/globalVars');

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((newUser) => res.status(STATUS_CREATED).send({ data: newUser }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(STATUS_BAD_REQ).send({ message: err.message });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const getAllUsers = (req, res) => {
  User.find({})
    .then((userList) => res.send({ data: userList }))
    .catch((err) => {
      res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error(ERROR_INVALID_ID))
    .then((foundUser) => res.send({ data: foundUser }))
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ + err.message });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(new Error(ERROR_INVALID_ID))
    .then((updatedUser) => {
      if (updatedUser) {
        res.send({ data: updatedUser });
      } else {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      }
    })
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError || err instanceof ValidationError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ + err.message });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(new Error(ERROR_INVALID_ID))
    .then((newAvatar) => res.send({ data: newAvatar }))
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError || err instanceof ValidationError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ + err.message });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserAvatar,
};
