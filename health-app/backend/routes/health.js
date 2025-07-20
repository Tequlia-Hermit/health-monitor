// backend/routes/health.js
const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/healthController');

router.get('/analysis', HealthController.getHealthAnalysis);

module.exports = router;