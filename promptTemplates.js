const promptTemplates = {
    // 基础对话模版
    basic: {
        system: "You are a helpful AI assistant. Please provide clear and concise responses.",
        user: "{userInput}"
    },
    
    // 带有笔记上下文的模版
    withContext: {
        system: "You are a helpful AI assistant. Please provide clear and concise responses.",
        user: `Context from notes:
               {notesContext}
               
               User question: {userInput}
               
               Please provide a response based on both the context and the question.`
    },
    
    // 带有Agent的模版
    withAgent: {
        system: "{agentDescription}",
        user: "{userInput}"
    },
    
    // 同时带有Agent和Context的模版
    withAgentAndContext: {
        system: "{agentDescription}",
        user: `Context from notes:
               {notesContext}
               
               User question: {userInput}
               
               Please provide a response based on both the context and the question.`
    }
};

module.exports = promptTemplates;
