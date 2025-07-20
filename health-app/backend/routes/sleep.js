// backend/routes/sleep.js
const express = require('express');
const router = express.Router();
const SleepController = require('../controllers/sleepController');

router.post('/save', SleepController.saveRecord);
router.get('/history', SleepController.getSleepHistory);

module.exports = router;