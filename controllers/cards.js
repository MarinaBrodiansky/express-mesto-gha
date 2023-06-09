const { CastError, ValidationError } = require('mongoose').Error;
const Card = require('../models/card');
const {
  STATUS_CREATED,
  STATUS_BAD_REQ,
  MSG_BAD_REQ,
  STATUS_SERVER_ERROR,
  MSG_SERVER_ERROR,
  ERROR_INVALID_ID,
  STATUS_NOT_FOUND,
  MSG_NOT_FOUND,
} = require('../utils/globalVars');

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(STATUS_CREATED).send({ data: newCard }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ + err.message });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const getCards = (req, res) => {
  Card.find({})
    .then((cardList) => res.send({ data: cardList }))
    .catch((err) => {
      res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error(ERROR_INVALID_ID))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const putLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error(ERROR_INVALID_ID))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

const deleteLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new Error(ERROR_INVALID_ID))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === ERROR_INVALID_ID) {
        res.status(STATUS_NOT_FOUND).send({ message: MSG_NOT_FOUND });
      } else if (err instanceof CastError) {
        res.status(STATUS_BAD_REQ).send({ message: MSG_BAD_REQ });
      } else {
        res.status(STATUS_SERVER_ERROR).send({ message: MSG_SERVER_ERROR + err.message });
      }
    });
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  putLike,
  deleteLike,
};
