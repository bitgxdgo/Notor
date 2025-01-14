const Database = require('better-sqlite3');
const path = require('path');

class DB {
    constructor() {
        // 数据库文件将保存在应用目录下
        const dbPath = path.join(__dirname, 'notes.db');
        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        // 创建文件夹表
        const createFoldersTable = `
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // 创建笔记表
        const createNotesTable = `
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (folder_id) REFERENCES folders(id)
            )
        `;

        try {
            this.db.exec(createFoldersTable);
            this.db.exec(createNotesTable);
            console.log('数据库表初始化成功');
        } catch (err) {
            console.error('数据库表初始化失败:', err);
        }
    }

    // 添加文件夹
    createFolder(name) {
        const stmt = this.db.prepare('INSERT INTO folders (name) VALUES (?)');
        try {
            const result = stmt.run(name);
            return result.lastInsertRowid;
        } catch (err) {
            console.error('创建文件夹失败:', err);
            throw err;
        }
    }

    // 获取所有文件夹
    getAllFolders() {
        const stmt = this.db.prepare('SELECT * FROM folders ORDER BY created_at DESC');
        try {
            return stmt.all();
        } catch (err) {
            console.error('获取文件夹列表失败:', err);
            throw err;
        }
    }

    // 添加笔记相关的方法
    createNote(folderId) {
        const created_at = new Date().toISOString();
        const stmt = this.db.prepare(
            'INSERT INTO notes (folder_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        );
        try {
            const result = stmt.run(folderId, '新建笔记', '在这里添加笔记', created_at, created_at);
            return result.lastInsertRowid;
        } catch (err) {
            console.error('创建笔记失败:', err);
            throw err;
        }
    }

    // 获取指定文件夹的所有笔记
    getNotesByFolder(folderId) {
        const stmt = this.db.prepare(
            'SELECT * FROM notes WHERE folder_id = ? ORDER BY created_at DESC'
        );
        try {
            return stmt.all(folderId);
        } catch (err) {
            console.error('获取笔记列表失败:', err);
            throw err;
        }
    }

    // 在 DB 类中添加更新笔记的方法
    updateNote(noteId, title, content, updated_at) {
        const stmt = this.db.prepare(
            'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?'
        );
        try {
            const result = stmt.run(title, content, updated_at, noteId);
            return result.changes > 0;
        } catch (err) {
            console.error('更新笔记失败:', err);
            throw err;
        }
    }

    // 添加删除笔记的方法
    deleteNote(noteId) {
        const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
        try {
            const result = stmt.run(noteId);
            return result.changes > 0;  // 返回是否删除成功
        } catch (err) {
            console.error('删除笔记失败:', err);
            throw err;
        }
    }

    // 添加删除文件夹的方法
    deleteFolder(folderId) {
        // 使用事务确保删除文件夹和笔记的操作是原子的
        const transaction = this.db.transaction(() => {
            // 先删除该文件夹下的所有笔记
            const deleteNotes = this.db.prepare('DELETE FROM notes WHERE folder_id = ?');
            deleteNotes.run(folderId);

            // 再删除文件夹
            const deleteFolder = this.db.prepare('DELETE FROM folders WHERE id = ?');
            const result = deleteFolder.run(folderId);
            
            return result.changes > 0;
        });

        try {
            return transaction();
        } catch (err) {
            console.error('删除文件夹失败:', err);
            throw err;
        }
    }

    // 添加重命名文件夹的方法
    renameFolder(folderId, newName) {
        const stmt = this.db.prepare('UPDATE folders SET name = ? WHERE id = ?');
        try {
            const result = stmt.run(newName, folderId);
            return result.changes > 0;
        } catch (err) {
            console.error('重命名文件夹失败:', err);
            throw err;
        }
    }

    // 初始化数据库表
    initTables() {
        const queries = [
            // 现有的表创建语句 ...
            
            // 创建会话表
            `CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // 创建消息表
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER,
                role TEXT NOT NULL,  /* 'user' 或 'assistant' */
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )`
        ];

        queries.forEach(query => {
            try {
                this.db.prepare(query).run();
            } catch (err) {
                console.error('创建表失败:', err);
                throw err;
            }
        });
    }

    // 添加会话相关的方法
    createConversation(title = '新对话') {
        const stmt = this.db.prepare(
            'INSERT INTO conversations (title, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        try {
            const result = stmt.run(title);
            return result.lastInsertRowid;
        } catch (err) {
            console.error('创建会话失败:', err);
            throw err;
        }
    }

    // 获取所有会话
    getConversations() {
        const stmt = this.db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC');
        try {
            return stmt.all();
        } catch (err) {
            console.error('获取会话列表失败:', err);
            throw err;
        }
    }

    // 获取指定会话的所有消息
    getMessages(conversationId) {
        const stmt = this.db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC');
        try {
            return stmt.all(conversationId);
        } catch (err) {
            console.error('获取消息失败:', err);
            throw err;
        }
    }

    // 添加新消息
    addMessage(conversationId, role, content) {
        const stmt = this.db.prepare(
            'INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
        );
        try {
            const result = stmt.run(conversationId, role, content);
            
            // 更新会话的更新时间
            this.db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(conversationId);
            
            return result.lastInsertRowid;
        } catch (err) {
            console.error('添加消息失败:', err);
            throw err;
        }
    }

    // 删除会话及其所有消息
    deleteConversation(conversationId) {
        try {
            this.db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);
            return true;
        } catch (err) {
            console.error('删除会话失败:', err);
            throw err;
        }
    }

    // 获取指定文件夹最近的10条笔记
    getRecentNotes(folderId, limit = 10) {
        const stmt = this.db.prepare(`
            SELECT id, title, updated_at 
            FROM notes 
            WHERE folder_id = ? 
            ORDER BY updated_at DESC 
            LIMIT ?
        `);
        try {
            return stmt.all(folderId, limit);
        } catch (err) {
            console.error('获取最近笔记失败:', err);
            throw err;
        }
    }

    // 获取指定 ID 的笔记
    getNoteById(noteId) {
        const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
        try {
            return stmt.get(noteId);
        } catch (err) {
            console.error('获取笔记失败:', err);
            throw err;
        }
    }

    // 添加搜索笔记的方法
    searchNotes(keyword) {
        const stmt = this.db.prepare(`
            SELECT id, title, updated_at 
            FROM notes 
            WHERE title LIKE ? 
            ORDER BY updated_at DESC
        `);
        try {
            return stmt.all(`${keyword}%`);
        } catch (err) {
            console.error('搜索笔记失败:', err);
            throw err;
        }
    }

    // 在 DB 类中添加获取最近会话的方法
    getRecentConversations(limit = 10) {
        const stmt = this.db.prepare(`
            SELECT id, title, created_at 
            FROM conversations 
            ORDER BY created_at DESC 
            LIMIT ?
        `);
        try {
            return stmt.all(limit);
        } catch (err) {
            console.error('获取最近会话失败:', err);
            throw err;
        }
    }
}

module.exports = DB;
