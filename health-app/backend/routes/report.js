// backend/routes/report.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.get('/avg-toilet-duration', ReportController.getAvgToiletDuration);
router.get('/avg-sleep-duration', ReportController.getAvgSleepDuration);
router.get('/toilet-data', ReportController.getToiletData);
router.get('/sleep-data', ReportController.getSleepData);


module.exports = router;