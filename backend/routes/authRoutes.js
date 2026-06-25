const router = require('express').Router();
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const c = require('../controllers/authController');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.get('/google', c.googleStart);
router.get('/google/callback', c.googleCallback);
router.get('/me', auth, c.me);
router.put('/me', auth, c.updateProfile);
router.get('/users', auth, requireAdmin, c.listUsers);
router.put('/users/:id/points', auth, requireAdmin, c.updateUserPoints);

module.exports = router;
