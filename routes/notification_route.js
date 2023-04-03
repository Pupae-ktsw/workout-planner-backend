const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const notificationController =  require('../controllers/notification_controller');

router.use(validateToken);
router.route('/').get(notificationController.SendNotification)
                .post(notificationController.SendNotificationDevice);

module.exports = router;