// backend/controllers/reportController.js
const db = require('../config/db');

class ReportController {
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

  static async getSleepData(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      
      const [rows] = await db.query(`
        SELECT date, MAX(time) as sleep_time
        FROM sleep_records 
        WHERE date >= CURDATE() - INTERVAL ? DAY
        GROUP BY date 
        ORDER BY date
      `, [days]);
      
      const dates = [];
      const hours = [];
      let totalHours = 0;
      
      rows.forEach(row => {
        dates.push(row.date.toISOString().split('T')[0]);
        
        // 计算睡眠时长（假设起床时间为7:00）
        const sleepTime = row.sleep_time;
        const sleepTimeParts = sleepTime.split(':');
        const sleepSeconds = parseInt(sleepTimeParts[0]) * 3600 + 
                             parseInt(sleepTimeParts[1]) * 60 + 
                             parseInt(sleepTimeParts[2] || 0);
        
        const wakeUpTime = 7 * 3600; // 7:00 AM
        
        let sleepDuration;
        if (sleepSeconds < 12 * 3600) { // 睡眠时间在中午之前（即晚上）
          sleepDuration = wakeUpTime + (24 * 3600 - sleepSeconds);
        } else {
          sleepDuration = wakeUpTime - sleepSeconds;
        }
        
        const sleepHours = 24 + parseFloat((sleepDuration / 3600).toFixed(1));
        hours.push(sleepHours);
        totalHours += sleepHours;
      });
      
      const avgHours = rows.length > 0 ? totalHours / rows.length : 0;
      
      res.json({
        success: true,
        dates,
        hours,
        avg_hours: avgHours.toFixed(1)
      });
    } catch (error) {
      console.error('获取睡眠数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取睡眠数据失败'
      });
    }
  }

  // 获取平均如厕时间（分钟）
  static async getAvgToiletDuration(req, res) {
    try {
      const days = parseInt(req.query.days) || 30; // 默认30天
      
      const [result] = await db.query(`
        SELECT AVG(duration) as avg_duration
        FROM toilet_records
        WHERE date >= CURDATE() - INTERVAL ? DAY
      `, [days]);
      
      const avgDuration = result[0].avg_duration 
        ? parseFloat(result[0].avg_duration).toFixed(1)
        : 0;
      
      res.json({
        success: true,
        avg_duration: avgDuration,
        days: days
      });
    } catch (error) {
      console.error('获取平均如厕时长失败:', error);
      res.status(500).json({
        success: false,
        message: '获取平均如厕时长失败'
      });
    }
  }

  // 获取平均睡眠时长（小时）
  static async getAvgSleepDuration(req, res) {
    try {
      const days = parseInt(req.query.days) || 30; // 默认30天
      
      const [rows] = await db.query(`
        SELECT date, MAX(time) as sleep_time
        FROM sleep_records 
        WHERE date >= CURDATE() - INTERVAL ? DAY
        GROUP BY date
      `, [days]);
      
      let totalHours = 0;
      let validDays = 0;
      
      rows.forEach(row => {
        // 计算睡眠时长（假设起床时间为7:00）
        const sleepTime = row.sleep_time;
        const sleepTimeParts = sleepTime.split(':');
        const sleepSeconds = parseInt(sleepTimeParts[0]) * 3600 + 
                             parseInt(sleepTimeParts[1]) * 60 + 
                             parseInt(sleepTimeParts[2] || 0);
        
        const wakeUpTime = 7 * 3600; // 7:00 AM
        
        let sleepDuration;
        if (sleepSeconds < 12 * 3600) { // 睡眠时间在中午之前（即晚上）
          sleepDuration = wakeUpTime + (24 * 3600 - sleepSeconds);
        } else {
          sleepDuration = wakeUpTime - sleepSeconds;
        }
        
        const sleepHours = parseFloat((sleepDuration / 3600).toFixed(1));
        totalHours += sleepHours;
        validDays++;
      });
      
      const avgHours = validDays > 0 ? totalHours / validDays : 0;
      
      res.json({
        success: true,
        avg_hours: avgHours.toFixed(1),
        days: days,
        records_count: validDays
      });
    } catch (error) {
      console.error('获取平均睡眠时长失败:', error);
      res.status(500).json({
        success: false,
        message: '获取平均睡眠时长失败'
      });
    }
  }


}

module.exports = ReportController;