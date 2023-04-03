const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    getSuggestProgram,
    getPrograms,
    getThisProgram,
    createProgram,
    createProgramAdmin,
    // updateProgram,
    deleteProgram
} = require('../controllers/program_controller');

const {
    getDaysOfProgram
} = require('../controllers/dayOfProgram_controller');

router.use(validateToken);
router.route('/admin').post(createProgramAdmin);
router.route('/suggest').get(getSuggestProgram);
router.route('/').get(getPrograms).post(createProgram);
router.route('/:id').get(getThisProgram)
                    // .put(updateProgram)
                    .delete(deleteProgram);
router.route('/:programId/days').get(getDaysOfProgram);

// router.route('/:id/').get();

/* /programs/<programId>/2 */

module.exports = router;