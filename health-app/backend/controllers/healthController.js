// backend/controllers/healthController.js
const db = require('../config/db');
const fetch = require('node-fetch');

class HealthController {
  static async getHealthAnalysis(req, res) {
    // 定义变量并设置默认值
    let avgSleepTime = "00:00";
    let avgDuration = "0.0";
    
    try {
      // 获取睡眠数据
      const [sleepRecords] = await db.query(
        "SELECT time FROM sleep_records WHERE date >= CURDATE() - INTERVAL 7 DAY"
      );
      
      let totalMinutes = 0;
      let count = sleepRecords.length;
      
      if (count > 0) {
        sleepRecords.forEach(record => {
          if (record.time) {
            const [hours, minutes] = record.time.split(':').map(Number);
            let timeInMinutes = hours * 60 + minutes;
            
            // 处理跨越午夜的情况
            if (timeInMinutes < 360) {
              timeInMinutes += 1440;
            }
            
            totalMinutes += timeInMinutes;
          }
        });
        
        const avgMinutes = totalMinutes / count;
        const avgHours = Math.floor(avgMinutes / 60) % 24;
        const avgMins = Math.floor(avgMinutes % 60);
        avgSleepTime = `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
      }

      // 获取如厕数据
      const [toiletResult] = await db.query(
        "SELECT AVG(duration) as avg_duration FROM toilet_records WHERE date >= CURDATE() - INTERVAL 7 DAY"
      );
      
      if (toiletResult[0]?.avg_duration) {
        avgDuration = parseFloat(toiletResult[0].avg_duration).toFixed(1);
      }

      // 调用火山引擎AI生成分析
      const aiAnalysis = await HealthController.generateVolcAnalysis(avgSleepTime, avgDuration);
      
      res.json({
        success: true,
        analysis: aiAnalysis
      });
    } catch (error) {
      console.error('获取健康分析失败:', error);
      
      // 即使出错也返回默认分析
      const aiAnalysis = `根据您近期的数据：平均入睡时间为 ${avgSleepTime}，平均如厕时长为 ${avgDuration} 分钟。建议保持规律作息并注意饮食健康。`;
      
      res.json({
        success: false,
        analysis: aiAnalysis,
        message: '获取健康分析失败',
        error: error.message
      });
    }
  }

  // 使用火山引擎API生成分析
  static async generateVolcAnalysis(avgSleepTime, avgDuration) {
    try {
      const prompt = `用户最近7天的平均入睡时间为${avgSleepTime}，平均如厕时长为${avgDuration}分钟。请生成专业的健康分析，包括作息评估和建议，不超过100字。`;
      
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 9f363b16-db3c-4cee-9ef9-55cf9c19da79',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "doubao-1-5-pro-32k-250115",
          messages: [
            {
              "role": "system",
              "content": "你是一位专业的健康顾问，请根据用户提供的数据生成简要的健康分析。分析要包含总结和建议，语言简洁专业。"
            },
            {
              "role": "user",
              "content": prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`火山引擎API错误: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      
      // 提取AI回复内容
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
      
      return "未能生成健康分析";
    } catch (error) {
      console.error('AI分析失败:', error);
      return `根据您近期的数据：平均入睡时间为 ${avgSleepTime}，平均如厕时长为 ${avgDuration} 分钟。建议保持规律作息并注意饮食健康。`;
    }
  }
}

module.exports = HealthController;