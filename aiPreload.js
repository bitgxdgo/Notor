const { ipcRenderer, contextBridge } = require('electron');
const DB = require('../db');
const promptTemplates = require('./promptTemplates');

// 创建数据库实例并初始化表
const dbInstance = new DB();
// 确保表已创建
dbInstance.initTables();

// 只暴露 AI 相关的功能
contextBridge.exposeInMainWorld('aiApi', {
    chat: async (messages) => {
        try {
            console.log('Sending chat request to main process:', messages);
            return await ipcRenderer.invoke('ai:chat', messages);
        } catch (error) {
            console.error('AI Chat Error in preload:', error);
            throw error;
        }
    },
    createConversation: async (title = '新对话') => {
        try {
            console.log('Creating new conversation...');
            const conversationId = await dbInstance.createConversation(title);
            console.log('Conversation created:', conversationId);
            return conversationId;
        } catch (error) {
            console.error('Create conversation error:', error);
            throw error;
        }
    },
    addMessage: async (conversationId, role, content) => {
        try {
            console.log('Adding message:', { conversationId, role, content });
            const messageId = await dbInstance.addMessage(conversationId, role, content);
            console.log('Message added:', messageId);
            return messageId;
        } catch (error) {
            console.error('Add message error:', error);
            throw error;
        }
    },
    getMessages: async (conversationId) => {
        try {
            return await dbInstance.getMessages(conversationId);
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    },
    getPromptTemplate: (type) => {
        return promptTemplates[type] || promptTemplates.basic;
    },
    getAllTemplates: () => promptTemplates,
    getRecentConversations: async () => {
        try {
            return await dbInstance.getRecentConversations();
        } catch (error) {
            console.error('Get recent conversations error:', error);
            throw error;
        }
    },
    search: async (query) => {
        try {
            return await ipcRenderer.invoke('ai:search', query);
        } catch (error) {
            console.error('Search API Error:', error);
            throw error;
        }
    }
});

console.log('AI API exposed successfully');
