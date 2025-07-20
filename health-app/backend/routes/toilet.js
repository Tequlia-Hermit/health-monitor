// backend/routes/toilet.js
const express = require('express');
const router = express.Router();
const ToiletController = require('../controllers/toiletController');

router.post('/save', ToiletController.saveRecord);
router.get('/data', ToiletController.getToiletData);

module.exports = router;