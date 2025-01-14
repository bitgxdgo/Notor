console.log('Starting preload script...');

const { contextBridge } = require('electron');
console.log('Electron modules loaded');

try {
    const DB = require('./db');
    const db = new DB();
    console.log('DB instance created successfully');

    contextBridge.exposeInMainWorld('db', {
        createFolder: async (name) => {
            console.log('Creating folder:', name);
            return await db.createFolder(name);
        },
        getAllFolders: async () => {
            console.log('Getting all folders');
            return await db.getAllFolders();
        },
        createNote: async (folderId, title, content) => {
            console.log('Creating note in folder:', folderId);
            return await db.createNote(folderId, title, content);
        },
        getNotesByFolder: async (folderId) => {
            console.log('Getting notes for folder:', folderId);
            return await db.getNotesByFolder(folderId);
        },
        updateNote: async (noteId, title, content) => {
            console.log('Updating note:', noteId);
            return await db.updateNote(noteId, title, content);
        },
        deleteNote: async (noteId) => {
            console.log('Deleting note:', noteId);
            return await db.deleteNote(noteId);
        },
        deleteFolder: async (folderId) => {
            console.log('Deleting folder:', folderId);
            return await db.deleteFolder(folderId);
        },
        renameFolder: async (folderId, newName) => {
            console.log('Renaming folder:', folderId, 'to:', newName);
            return await db.renameFolder(folderId, newName);
        },
        getRecentNotes: async (folderId, limit) => {
            console.log('Getting recent notes for folder:', folderId);
            return await db.getRecentNotes(folderId, limit);
        },
        getNoteById: async (noteId) => {
            console.log('Getting note by ID:', noteId);
            return await db.getNoteById(noteId);
        },
        searchNotes: async (keyword) => {
            console.log('Searching notes with keyword:', keyword);
            return await db.searchNotes(keyword);
        },
    });

    require('./ai/aiPreload');
    console.log('AI features loaded successfully');

    console.log('API exposed successfully');
} catch (error) {
    console.error('Error in preload script:', error);
}
