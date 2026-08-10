        async function handleLogin() {
            let email = document.getElementById('authEmail').value.trim();
            let pwd = document.getElementById('authPassword').value;
            if(!email || !pwd) { showToast('请输入账号和密码', 'warning'); return; }
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

        // 🌟 核心：监听用户从邮件里点击链接跳回网页的动作
        db.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // 如果检测到是点击“重置密码”链接回来的，直接弹出设置新密码的界面
                showScreen('reset-screen');
            }
        });

        async function handleDoResetPassword() {
            let newPwd = document.getElementById('resetNewPassword').value;
            if(newPwd.length < 6) { showToast('新密码至少需要6位', 'warning'); return; }
            showLoading('正在重置...');
            // 直接更新密码，无需验证码
            const { error } = await db.auth.updateUser({ password: newPwd });
            hideLoading();
            if(error) return showToast('更新失败：' + error.message, 'error');
            
            showToast('密码重置成功！', 'success');
            // 重置完毕后直接拿当前 session 进入管理大盘
            currentUser = (await db.auth.getUser()).data.user;
            initCloudData();
        }

        async function saveQueryKey() {
            let key = document.getElementById('settingQueryKey').value.trim();
            if(!key) { showToast('请输入密钥！', 'warning'); return; }
            showLoading('保存密钥...');
            const { error } = await db.from('leader_data').update({ query_key: key }).eq('user_id', currentUser.id);
            hideLoading();
            if(error) showToast('密钥保存失败！', 'error');
            else showToast('全局密钥设置成功！', 'success');
        }

        async function handleLogout() {
            await db.auth.signOut(); 
            localStorage.removeItem('assistant_uid'); // 清除副团长状态
            currentUser = null; groupData = []; imageUrlData = {}; 
            showScreen('portal-screen');
        }

        async function initCloudData() {
            try {
                showLoading('正在拉取数据...');
                const { data, error } = await db.from('leader_data').select('*').eq('user_id', currentUser.id).single();
                if(data) {
                    groupData = data.group_data || []; imageUrlData = data.image_data || {};
                    document.getElementById('settingQueryKey').value = data.query_key || '';
                } else { await db.from('leader_data').insert({ user_id: currentUser.id, group_data: [], image_data: {} }); }
            } catch(e) {} finally { hideLoading(); showScreen('dashboard-screen'); updateBatchDatalist(); switchTab('input'); }
        }

        // 页面启动时检查是否已登录（放在 auth.js 末尾，确保 initCloudData 已定义）
        db.auth.getSession().then(({ data: { session } }) => {
            if (session) { currentUser = session.user; initCloudData(); }
            else showScreen('portal-screen');
        });
