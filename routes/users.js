const router = require('express').Router();
const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:userId', getUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
