// backend/controllers/healthController.js
const db = require('../config/db');

class HealthController {
  static async getHealthAnalysis(req, res) {
    try {
      // 获取睡眠数据
      const [sleepResult] = await db.query(
        "SELECT AVG(TIME_TO_SEC(time)) as avg_sleep_time FROM sleep_records WHERE date >= CURDATE() - INTERVAL 7 DAY"
      );
      
      const avgSleepTime = sleepResult[0]?.avg_sleep_time 
        ? new Date(sleepResult[0].avg_sleep_time * 1000).toISOString().substr(11, 5)
        : '00:00';

      // 获取如厕数据
      const [toiletResult] = await db.query(
        "SELECT AVG(duration) as avg_duration FROM toilet_records WHERE date >= CURDATE() - INTERVAL 7 DAY"
      );
      
      const avgDuration = toiletResult[0]?.avg_duration 
        ? parseFloat(toiletResult[0].avg_duration).toFixed(1)
        : 0;

      // 生成健康分析和建议
      const summary = "根据您近期的数据，您的作息基本规律：";
      const summaryHTML = `${summary}
        <ul style='padding-left: 20px; margin-top: 10px;'>
          <li>平均入睡时间为 ${avgSleepTime}</li>
          <li>平均如厕时长为 ${avgDuration} 分钟</li>
        </ul>`;

      const tips = [
        {
          title: '改善睡眠质量',
          content: '尝试在睡前1小时避免使用电子设备，保持卧室温度在18-22℃之间，有助于更快入睡。'
        },
        {
          title: '饮水习惯',
          content: '根据您的如厕记录，建议在上午9点后减少饮水量，避免影响上午的工作效率。'
        },
        {
          title: '运动建议',
          content: '每天保持30分钟中等强度运动，如快走或慢跑，有助于改善消化和睡眠。'
        }
      ];

      res.json({
        success: true,
        summary: summaryHTML,
        tips
      });
    } catch (error) {
      console.error('获取健康分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取健康分析失败'
      });
    }
  }
}

module.exports = HealthController;