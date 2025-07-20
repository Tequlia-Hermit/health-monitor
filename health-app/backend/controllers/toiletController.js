// backend/controllers/toiletController.js
const db = require('../config/db');

class ToiletController {
  static async saveRecord(req, res) {
    try {
      const { date, time, duration } = req.body;
      
      const [result] = await db.query(
        'INSERT INTO toilet_records (date, time, duration) VALUES (?, ?, ?)',
        [date, time, duration]
      );
      
      res.status(201).json({
        success: true,
        message: '如厕记录保存成功',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('保存如厕记录失败:', error);
      res.status(500).json({
        success: false,
        message: '保存如厕记录失败'
      });
    }
  }

  static async getToiletData(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      
      const [rows] = await db.query(`
        SELECT date, AVG(duration) as avg_duration 
        FROM toilet_records 
        WHERE date >= CURDATE() - INTERVAL ? DAY
        GROUP BY date 
        ORDER BY date
      `, [days]);
      
      const dates = [];
      const durations = [];
      let totalDuration = 0;
      
      rows.forEach(row => {
        dates.push(row.date.toISOString().split('T')[0]);
        durations.push(parseFloat(row.avg_duration));
        totalDuration += parseFloat(row.avg_duration);
      });
      
      const avgDuration = rows.length > 0 ? totalDuration / rows.length : 0;
      
      res.json({
        success: true,
        dates,
        durations,
        avg_duration: avgDuration.toFixed(1)
      });
    } catch (error) {
      console.error('获取如厕数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取如厕数据失败'
      });
    }
  }
}

module.exports = ToiletController;