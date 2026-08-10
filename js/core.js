        function generateSafeId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

        let groupData = [];
        let imageUrlData = {};
        
        let currentManageBatch = 'all';
        let currentSearchKeyword = ''; 
        
        window.scheduleSteps = {};
        window.scheduleCols = {}; 

        let currentEditImageKey = '';
        let currentUser = null;
        let resetTargetEmail = ''; 
        let registerTargetEmail = ''; 
        let draggedItemRowId = null;
        let dismissedReqIds = new Set();

        function showLoading(text="处理中...") { document.getElementById('loadingText').innerText=text; document.getElementById('globalLoading').classList.remove('hidden'); }
        function hideLoading() { document.getElementById('globalLoading').classList.add('hidden'); }
        function showScreen(screenId) {
            ['portal-screen', 'buyer-screen', 'shipping-apply-screen', 'payment-apply-screen', 'login-screen', 'register-screen', 'verify-signup-screen', 'forgot-screen', 'reset-screen', 'dashboard-screen', 'rank-screen'].forEach(id => {
                let el = document.getElementById(id);
                if(el) el.classList.add('hidden');
            });
            document.getElementById(screenId).classList.remove('hidden');
        }

        // XSS 防护：转义 HTML 特殊字符
        function escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(String(str)));
            return div.innerHTML;
        }

        function updateSyncStatus(status) {
            const statusEl = document.getElementById('syncStatusText');
            if(!statusEl) return;
            if(status === 'saving') {
                statusEl.innerHTML = '⏳ 正在保存...';
                statusEl.className = 'text-yellow-600 font-bold flex items-center gap-1 text-sm';
            } else if(status === 'saved') {
                statusEl.innerHTML = '☁️ 云端已同步';
                statusEl.className = 'text-green-500 font-bold flex items-center gap-1 text-sm';
            } else if(status === 'error') {
                statusEl.innerHTML = '❌ 同步失败';
                statusEl.className = 'text-red-500 font-bold flex items-center gap-1 text-sm';
            }
        }
