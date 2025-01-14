const OpenAI = require('openai');

class AIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
        this.perplexityBaseUrl = "https://api.perplexity.ai/chat/completions";
    }

    async chat(messages) {
        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
                temperature: 0.7,
            });

            return completion.choices[0].message;
        } catch (error) {
            console.error('OpenAI API 调用失败:', error);
            throw error;
        }
    }

    async search(query) {
        const headers = {
            "Authorization": `Bearer ${this.perplexityApiKey}`,
            "Content-Type": "application/json"
        };
        
        const payload = {
            "model": "llama-3.1-sonar-large-128k-online",
            "messages": [
                {
                    "role": "system",
                    "content": "Be precise and concise."
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            "temperature": 0.2,
            "top_p": 0.9,
            "return_images": false,
            "return_related_questions": false,
            "search_recency_filter": "month",
            "stream": false
        };

        try {
            const response = await fetch(this.perplexityBaseUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`搜索请求失败: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Perplexity API 响应数据:', JSON.stringify(data, null, 2));
            return {
                content: data.choices[0].message.content,
                citations: data.citations || []
            };
        } catch (error) {
            console.error('搜索服务错误:', error);
            throw error;
        }
    }
}

module.exports = AIService;
