const { ValidationError } = require('mongoose').Error;
const Card = require('../models/card');
const {
  STATUS_CREATED,
  // STATUS_BAD_REQ,
  // MSG_BAD_REQ,
  // STATUS_SERVER_ERROR,
  // MSG_SERVER_ERROR,
  // ERROR_INVALID_ID,
  // STATUS_NOT_FOUND,
  // MSG_NOT_FOUND,
} = require('../utils/globalVars');
const BadRequestError = require('../utils/errors/400-BadRequest');
// const UnauthorizedError = require('../utils/errors/401-Unauthorized');
const ForbiddenError = require('../utils/errors/403-Forbidden');
const NotFoundError = require('../utils/errors/404-NotFound');
// const ConflictRequestError = ('../utils/errors/409-ConflictRequest');

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.status(STATUS_CREATED).send({ data: newCard }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const getCards = (req, res, next) => {
  Card.find({})
    .then((cardList) => res.send({ data: cardList }))
    .catch((err) => next(err));
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id: userId } = req.user._id;
  Card.findByIdAndRemove({ _id: cardId, owner: userId })
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card.owner.equals(userId)) {
        return next(new ForbiddenError('Вы не можете удалить эту карточку'));
      }
      res.send({ data: {} });
    })
    .catch((err) => next(err));
};

const putLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => next(err));
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => next(err));
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  putLike,
  deleteLike,
};
