// 本地调试账户：无需联网，数据存浏览器 localStorage
const DEBUG_EMAIL = 'test@test.com';
const DEBUG_PWD = 'test123';
const DEBUG_USER_ID = 'debug-local-user';

async function handleLogin() {
    let email = document.getElementById('authEmail').value.trim();
    let pwd = document.getElementById('authPassword').value;
    if(!email || !pwd) { showToast('请输入账号和密码', 'warning'); return; }
    // 调试账户绕过 Supabase，纯本地模式
    if (email === DEBUG_EMAIL && pwd === DEBUG_PWD) {
        currentUser = { id: DEBUG_USER_ID, email: DEBUG_EMAIL, isDebug: true };
        initCloudData();
        return;
    }
    showLoading('登录中...');
    try {
        const { data, error } = await db.auth.signInWithPassword({ email, password: pwd });
        hideLoading();
        if(error) { showToast('登录失败: 账号不存在或密码错误', 'error'); return; }
        currentUser = data.user; initCloudData();
    } catch (err) { hideLoading(); showToast('连接云端失败！', 'error'); }
}

async function handleRegisterSubmit() {
    let email = document.getElementById('regEmail').value.trim();
    let pwd = document.getElementById('regPassword').value;
    if(!email) { showToast('请正确填写邮箱！', 'warning'); return; }
    if(pwd.length < 6 || pwd !== document.getElementById('regConfirmPassword').value) { showToast('密码无效或不一致！', 'warning'); return; }
    showLoading('提交注册中...');
    try {
        const { data, error } = await db.auth.signUp({ email, password: pwd, options: { emailRedirectTo: window.location.origin } });
        hideLoading();
        if(error) showToast('注册失败: ' + error.message, 'error');
        else {
            showToast('注册成功！请前往邮箱点击确认链接完成注册。（可能在垃圾邮件里）', 'success');
            showScreen('login-screen');
        }
    } catch (err) { hideLoading(); showToast('错误，请检查网络', 'error'); }
}

async function handleSendResetCode() {
    let email = document.getElementById('forgotEmail').value.trim();
    if(!email) { showToast('请输入注册时的邮箱', 'warning'); return; }
    showLoading('发送请求中...');
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    hideLoading();
    if(error) showToast('发送失败: ' + error.message, 'error');
    else {
        showToast('密码重置链接已发送！请前往邮箱点击链接设置新密码。', 'success');
        showScreen('login-screen');
    }
}

// 核心：监听用户从邮件里点击链接跳回网页的动作
db.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        showScreen('reset-screen');
    }
});

async function handleDoResetPassword() {
    let newPwd = document.getElementById('resetNewPassword').value;
    if(newPwd.length < 6) { showToast('新密码至少需要6位', 'warning'); return; }
    showLoading('正在重置...');
    const { error } = await db.auth.updateUser({ password: newPwd });
    hideLoading();
    if(error) return showToast('更新失败：' + error.message, 'error');

    showToast('密码重置成功！', 'success');
    currentUser = (await db.auth.getUser()).data.user;
    initCloudData();
}

async function saveQueryKey() {
    let key = document.getElementById('settingQueryKey').value.trim();
    if(!key) { showToast('请输入密钥！', 'warning'); return; }
    if (currentUser.isDebug) { showToast('调试模式不支持密钥设置', 'info'); return; }
    showLoading('保存密钥...');
    const { error } = await db.from('leader_data').update({ query_key: key }).eq('user_id', currentUser.id);
    hideLoading();
    if(error) showToast('密钥保存失败！', 'error');
    else showToast('全局密钥设置成功！', 'success');
}

async function handleLogout() {
    if (!currentUser.isDebug) await db.auth.signOut();
    localStorage.removeItem('assistant_uid');
    currentUser = null; groupData = []; imageUrlData = {};
    showScreen('portal-screen');
}

async function initCloudData() {
    try {
        // 调试账户：从 localStorage 读取数据
        if (currentUser.isDebug) {
            const saved = localStorage.getItem('groupData_V4');
            if (saved) groupData = JSON.parse(saved);
            const savedImg = localStorage.getItem('imageUrlData_V1');
            if (savedImg) imageUrlData = JSON.parse(savedImg);
            showScreen('dashboard-screen'); updateBatchDatalist(); switchTab('input');
            if (typeof applyBackground === 'function') applyBackground();
            if (typeof applyFeatureToggles === 'function') applyFeatureToggles();
            return;
        }
        showLoading('正在拉取数据...');
        const { data, error } = await db.from('leader_data').select('*').eq('user_id', currentUser.id).single();
        if(data) {
            groupData = data.group_data || []; imageUrlData = data.image_data || {};
            document.getElementById('settingQueryKey').value = data.query_key || '';
        } else { await db.from('leader_data').insert({ user_id: currentUser.id, group_data: [], image_data: {} }); }
    } catch(e) {} finally { hideLoading(); showScreen('dashboard-screen'); updateBatchDatalist(); switchTab('input'); if (typeof applyBackground === 'function') applyBackground(); if (typeof applyFeatureToggles === 'function') applyFeatureToggles(); }
}

// 页面启动时检查是否已登录（放在 auth.js 末尾，确保 initCloudData 已定义）
db.auth.getSession().then(({ data: { session } }) => {
    if (session) { currentUser = session.user; initCloudData(); }
    else showScreen('portal-screen');
});
