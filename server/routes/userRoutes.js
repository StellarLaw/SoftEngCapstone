const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/userController');

router.put('/change-password', protect, changePassword);

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;