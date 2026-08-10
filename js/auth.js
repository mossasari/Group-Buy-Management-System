        async function handleLogin() {
            let email = document.getElementById('authEmail').value.trim();
            let pwd = document.getElementById('authPassword').value;
            if(!email || !pwd) return alert('请输入账号和密码');
            showLoading('登录中...');
            try {
                const { data, error } = await db.auth.signInWithPassword({ email, password: pwd });
                hideLoading();
                if(error) { alert('登录失败: 账号不存在或密码错误'); return; }
                currentUser = data.user; initCloudData();
            } catch (err) { hideLoading(); alert('连接云端失败！'); }
        }

        async function handleRegisterSubmit() {
            let email = document.getElementById('regEmail').value.trim();
            let pwd = document.getElementById('regPassword').value;
            if(!email) return alert('请正确填写邮箱！');
            if(pwd.length < 6 || pwd !== document.getElementById('regConfirmPassword').value) return alert('密码无效或不一致！');
            showLoading('提交注册中...');
            try {
                const { data, error } = await db.auth.signUp({ email, password: pwd });
                hideLoading();
                if(error) alert('注册失败: ' + error.message);
                else { 
                    alert('✅ 注册成功！\n\n请前往您的邮箱，点击邮件中的【确认链接】即可完成注册。（可能在垃圾邮件里）'); 
                    showScreen('login-screen'); 
                }
            } catch (err) { hideLoading(); alert('错误，请检查网络'); }
        }

        async function handleSendResetCode() {
            let email = document.getElementById('forgotEmail').value.trim();
            if(!email) return alert('请输入注册时的邮箱');
            showLoading('发送请求中...');
            const { error } = await db.auth.resetPasswordForEmail(email);
            hideLoading();
            if(error) alert('发送失败: ' + error.message);
            else { 
                alert('✅ 密码重置链接已发送！\n\n请前往您的邮箱点击链接，网页将自动唤起并允许您设置新密码。'); 
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
            if(newPwd.length < 6) return alert('新密码至少需要6位');
            showLoading('正在重置...');
            // 直接更新密码，无需验证码
            const { error } = await db.auth.updateUser({ password: newPwd });
            hideLoading();
            if(error) return alert('更新失败：' + error.message);
            
            alert('✅ 密码重置成功！');
            // 重置完毕后直接拿当前 session 进入管理大盘
            currentUser = (await db.auth.getUser()).data.user;
            initCloudData();
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
