// backend/controllers/sleepController.js
const db = require('../config/db');

class SleepController {
  static async saveRecord(req, res) {
    try {
      const { date, time } = req.body;
      
      const [result] = await db.query(
        'INSERT INTO sleep_records (date, time) VALUES (?, ?)',
        [date, time]
      );
      
      res.status(201).json({
        success: true,
        message: '睡眠记录保存成功',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('保存睡眠记录失败:', error);
      res.status(500).json({
        success: false,
        message: '保存睡眠记录失败'
      });
    }
  }

  static async getSleepHistory(req, res) {
    try {
      const [rows] = await db.query(
        'SELECT date, time FROM sleep_records ORDER BY date DESC, time DESC LIMIT 5'
      );
      
      res.json({
        success: true,
        history: rows
      });
    } catch (error) {
      console.error('获取睡眠历史失败:', error);
      res.status(500).json({
        success: false,
        message: '获取睡眠历史失败'
      });
    }
  }
}

module.exports = SleepController;