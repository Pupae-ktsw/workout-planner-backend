const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    getCalendarEvents
} = require('../controllers/calendarEvent_controller');

router.use(validateToken);
router.route('/').get(getCalendarEvents);
//

module.exports = router;