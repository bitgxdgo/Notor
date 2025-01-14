require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const db = require('./db')

// 修改引用路径
const AIService = require(path.join(__dirname, 'ai', 'aiService'));
const aiService = new AIService();

// 添加 AI IPC 处理
ipcMain.handle('ai:chat', async (event, messages) => {
    try {
        return await aiService.chat(messages);
    } catch (error) {
        console.error('AI Chat Error:', error);
        throw error;
    }
});

// 添加搜索 IPC 处理
ipcMain.handle('ai:search', async (event, query) => {
    try {
        return await aiService.search(query);
    } catch (error) {
        console.error('Search Error:', error);
        throw error;
    }
});

const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev ? 
    path.join(__dirname, 'notes.db') : 
    path.join(process.resourcesPath, 'app', 'notes.db');

// 根据运行环境选择正确的 .env 文件路径
const envPath = isDev 
  ? path.join(__dirname, '.env')
  : path.join(process.resourcesPath, '.env');

require('dotenv').config({ path: envPath });

function createWindow () {
    const preloadPath = path.join(__dirname, 'preload.js')
    const aiPreloadPath = path.join(__dirname, 'ai', 'aiPreload.js')
    console.log('Preload script path:', preloadPath)
    console.log('AI Preload script path:', aiPreloadPath)

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
            preload: preloadPath,
            additionalPreload: aiPreloadPath
        }
    })

    win.webContents.openDevTools()
    
    win.webContents.on('console-message', (event, level, message) => {
        console.log('Renderer Process:', message);
    });

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Page failed to load:', errorDescription)
    })

    win.webContents.on('preload-error', (event, preloadPath, error) => {
        console.error('Preload script error:', error)
    })

    console.log('Window created with preload scripts')
    win.loadFile('index.html')
}

// 设置应用级别的错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

app.whenReady().then(() => {
  console.log('App is ready, creating window...')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
