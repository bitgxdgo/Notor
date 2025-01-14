const AIService = require('./aiService');

class AIController {
    constructor() {
        this.aiService = new AIService();
    }

    async handleChat(userMessage) {
        try {
            // 构建消息数组
            const messages = [{
                role: 'user',
                content: userMessage
            }];

            // 调用 AI 服务
            const response = await this.aiService.chat(messages);
            return response;
            
        } catch (error) {
            console.error('AI 对话处理失败:', error);
            throw error;
        }
    }
}

module.exports = AIController;
