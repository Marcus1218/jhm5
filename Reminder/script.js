class ReminderManager {
    constructor() {
        this.reminders = this.loadReminders();
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderReminders();
        this.updateStats();
    }

    bindEvents() {
        // 新增提醒按鈕事件
        document.getElementById('addBtn').addEventListener('click', () => {
            this.addReminder();
        });

        // 輸入框回車事件
        document.getElementById('reminderInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addReminder();
            }
        });

        // 篩選按鈕事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // 新增提醒
    addReminder() {
        const input = document.getElementById('reminderInput');
        const text = input.value.trim();

        if (!text) {
            this.showNotification('請輸入提醒內容！', 'error');
            return;
        }

        if (text.length > 100) {
            this.showNotification('提醒內容不能超過100個字元！', 'error');
            return;
        }

        const reminder = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.reminders.unshift(reminder);
        this.saveReminders();
        this.renderReminders();
        this.updateStats();
        
        input.value = '';
        this.showNotification('提醒已新增！', 'success');
    }

    // 切換提醒完成狀態
    toggleReminder(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.completed = !reminder.completed;
            reminder.updatedAt = new Date().toISOString();
            this.saveReminders();
            this.renderReminders();
            this.updateStats();
            
            const status = reminder.completed ? '已完成' : '待辦';
            this.showNotification(`提醒狀態已更新為：${status}`, 'info');
        }
    }

    // 刪除提醒
    deleteReminder(id) {
        if (confirm('確定要刪除這個提醒嗎？')) {
            this.reminders = this.reminders.filter(r => r.id !== id);
            this.saveReminders();
            this.renderReminders();
            this.updateStats();
            this.showNotification('提醒已刪除！', 'success');
        }
    }

    // 開始編輯提醒
    startEdit(id) {
        if (this.editingId) {
            this.cancelEdit();
        }
        
        this.editingId = id;
        const item = document.querySelector(`[data-id="${id}"]`);
        const textElement = item.querySelector('.reminder-text');
        const editInput = item.querySelector('.edit-input');
        const actions = item.querySelector('.reminder-actions');
        
        // 設置輸入框的值
        editInput.value = textElement.textContent;
        
        // 切換顯示狀態
        item.classList.add('editing');
        editInput.focus();
        
        // 更新操作按鈕
        actions.innerHTML = `
            <button class="action-btn save-btn" onclick="reminderManager.saveEdit(${id})">
                <i class="fas fa-save"></i> 儲存
            </button>
            <button class="action-btn cancel-btn" onclick="reminderManager.cancelEdit()">
                <i class="fas fa-times"></i> 取消
            </button>
        `;
    }

    // 儲存編輯
    saveEdit(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        const editInput = item.querySelector('.edit-input');
        const newText = editInput.value.trim();
        
        if (!newText) {
            this.showNotification('提醒內容不能為空！', 'error');
            return;
        }
        
        if (newText.length > 100) {
            this.showNotification('提醒內容不能超過100個字元！', 'error');
            return;
        }
        
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.text = newText;
            reminder.updatedAt = new Date().toISOString();
            this.saveReminders();
            this.editingId = null;
            this.renderReminders();
            this.showNotification('提醒已更新！', 'success');
        }
    }

    // 取消編輯
    cancelEdit() {
        this.editingId = null;
        this.renderReminders();
    }

    // 設置篩選
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新按鈕狀態
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderReminders();
    }

    // 獲取篩選後的提醒
    getFilteredReminders() {
        switch (this.currentFilter) {
            case 'completed':
                return this.reminders.filter(r => r.completed);
            case 'pending':
                return this.reminders.filter(r => !r.completed);
            default:
                return this.reminders;
        }
    }

    // 渲染提醒列表
    renderReminders() {
        const container = document.getElementById('remindersList');
        const filteredReminders = this.getFilteredReminders();
        
        if (filteredReminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>${this.getEmptyStateMessage()}</h3>
                    <p>開始新增您的第一個提醒吧！</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredReminders.map(reminder => `
            <div class="reminder-item ${reminder.completed ? 'completed' : ''}" data-id="${reminder.id}">
                <input type="checkbox" class="reminder-checkbox" 
                       ${reminder.completed ? 'checked' : ''} 
                       onchange="reminderManager.toggleReminder(${reminder.id})">
                
                <div class="reminder-text">${this.escapeHtml(reminder.text)}</div>
                
                <input type="text" class="edit-input" value="${this.escapeHtml(reminder.text)}">
                
                <div class="reminder-actions">
                    <button class="action-btn edit-btn" onclick="reminderManager.startEdit(${reminder.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="action-btn delete-btn" onclick="reminderManager.deleteReminder(${reminder.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 獲取空狀態訊息
    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'completed':
                return '還沒有已完成的提醒';
            case 'pending':
                return '沒有待辦的提醒事項';
            default:
                return '還沒有提醒事項';
        }
    }

    // 更新統計數據
    updateStats() {
        const total = this.reminders.length;
        const completed = this.reminders.filter(r => r.completed).length;
        const pending = total - completed;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;
    }

    // 儲存提醒到本地儲存
    saveReminders() {
        try {
            localStorage.setItem('reminders', JSON.stringify(this.reminders));
        } catch (error) {
            console.error('儲存提醒失敗:', error);
            this.showNotification('儲存失敗！請檢查瀏覽器儲存空間。', 'error');
        }
    }

    // 從本地儲存載入提醒
    loadReminders() {
        try {
            const saved = localStorage.getItem('reminders');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('載入提醒失敗:', error);
            this.showNotification('載入提醒失敗！', 'error');
            return [];
        }
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        // 移除現有通知
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // 創建新通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // 添加樣式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // 設置背景顏色
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#667eea',
            warning: '#ffc107'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // 動畫顯示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自動隱藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // 獲取通知圖標
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    // 轉義 HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 清空所有提醒
    clearAllReminders() {
        if (confirm('確定要清空所有提醒嗎？此操作無法復原！')) {
            this.reminders = [];
            this.saveReminders();
            this.renderReminders();
            this.updateStats();
            this.showNotification('所有提醒已清空！', 'success');
        }
    }

    // 匯出提醒
    exportReminders() {
        try {
            const data = {
                reminders: this.reminders,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `提醒備份_${new Date().toLocaleDateString('zh-TW')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('提醒已匯出！', 'success');
        } catch (error) {
            console.error('匯出失敗:', error);
            this.showNotification('匯出失敗！', 'error');
        }
    }
}

// 初始化應用程式
let reminderManager;

document.addEventListener('DOMContentLoaded', () => {
    reminderManager = new ReminderManager();
    
    // 添加鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 快速新增提醒
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            reminderManager.addReminder();
        }
        
        // ESC 取消編輯
        if (e.key === 'Escape' && reminderManager.editingId) {
            reminderManager.cancelEdit();
        }
    });
    
    // 添加頁面離開前的確認
    window.addEventListener('beforeunload', (e) => {
        if (reminderManager.editingId) {
            e.preventDefault();
            e.returnValue = '您有未儲存的編輯，確定要離開嗎？';
        }
    });
});
