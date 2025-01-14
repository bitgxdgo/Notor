class PromptManager {
    constructor() {
        this.cachedPrompt = {
            systemContent: null,
            contextContent: null
        };
    }

    // 预加载 Agent 描述
    setAgent(agentDescription) {
        this.cachedPrompt.systemContent = agentDescription;
    }

    // 预加载上下文内容
    async updateContext(selectedNotes) {
        if (!selectedNotes || selectedNotes.size === 0) {
            this.cachedPrompt.contextContent = null;
            return;
        }

        try {
            const contents = [];
            for (const noteId of selectedNotes) {
                const note = await window.db.getNoteById(noteId);
                if (note) {
                    contents.push(`${note.title}:\n${note.content}`);
                }
            }
            this.cachedPrompt.contextContent = contents.join('\n\n');
        } catch (error) {
            console.error('获取笔记内容失败:', error);
            this.cachedPrompt.contextContent = null;
        }
    }

    // 获取预加载的内容
    getCachedPrompt() {
        return this.cachedPrompt;
    }

    // 清除缓存
    clear() {
        this.cachedPrompt.systemContent = null;
        this.cachedPrompt.contextContent = null;
    }
}

window.promptManager = new PromptManager();
