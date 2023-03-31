const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    updateWorkoutStatus
} = require('../controllers/dayOfProgram_controller');

router.use(validateToken);
router.route('/:id').put(updateWorkoutStatus);

module.exports = router;