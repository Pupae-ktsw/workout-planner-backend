const express = require('express');
const router = express.Router();
const {
    getPrograms,
    getThisProgram,
    createProgram,
    updateProgram,
    deleteProgram
} = require('../controllers/program_controller');

router.route('/').get(getPrograms).post(createProgram);
router.route('/:id').get(getThisProgram)
                    .put(updateProgram)
                    .delete(deleteProgram);

router.route('/:id/').get();

/* /programs/<programId>/2 */

module.exports = router;