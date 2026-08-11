        async function forceRefreshData() {
            if(!currentUser) return;
            if(currentUser.isDebug) { location.reload(); return; }
            showLoading('正在从云端拉取最新数据...');
            try {
                const { data, error } = await db.from('leader_data').select('*').eq('user_id', currentUser.id).single();
                if(error) throw error;
                if(data) {
                    groupData = data.group_data || [];
                    imageUrlData = data.image_data || {};
                    document.getElementById('settingQueryKey').value = data.query_key || '';
                    saveDataLocalOnly(); updateBatchDatalist();
                    let activeTabBtn = document.querySelector('.tab-active');
                    if(activeTabBtn) { switchTab(activeTabBtn.id.replace('tab-', '')); }
                    updateSyncStatus('saved');
                }
            } catch(e) { console.error(e); showToast('刷新拉取失败，请检查网络！', 'error'); }
            finally { hideLoading(); }
        }

        let saveTimeout = null;
        async function syncToCloud() {
            if(!currentUser) return;
            if(currentUser.isDebug) { saveDataLocalOnly(); updateSyncStatus('saved'); return; }
            updateSyncStatus('saving'); clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                try {
                    const { data: cloudData } = await db.from('leader_data').select('image_data').eq('user_id', currentUser.id).single();
                    if(cloudData && cloudData.image_data) {
                        mergeReqs('__PAYMENT_REQS__', cloudData.image_data);
                        mergeReqs('__SHIPPING_REQS__', cloudData.image_data);
                    }
                    const { error } = await db.from('leader_data').update({ group_data: groupData, image_data: imageUrlData }).eq('user_id', currentUser.id);
                    if (error) throw error;
                    updateSyncStatus('saved');
                } catch (e) {
                    updateSyncStatus('error');
                }
            }, 1000); 
        }


        function mergeReqs(key, cloudImgData) {
            let localReqs = JSON.parse(imageUrlData[key] || '[]');
            let cloudReqs = JSON.parse(cloudImgData[key] || '[]');
            let localIds = new Set(localReqs.map(r => r.id));
            let newFromCloud = cloudReqs.filter(r => !localIds.has(r.id) && !dismissedReqIds.has(r.id));
            if(newFromCloud.length > 0) {
                localReqs.push(...newFromCloud);
                imageUrlData[key] = JSON.stringify(localReqs);
            }
        }


        function saveDataLocalOnly() { localStorage.setItem('groupData_V4', JSON.stringify(groupData)); localStorage.setItem('imageUrlData_V1', JSON.stringify(imageUrlData)); }
        function saveData() { saveDataLocalOnly(); updateBatchDatalist(); syncToCloud(); }
        function saveImageUrlData() { saveDataLocalOnly(); syncToCloud(); }


        function updateBatchDatalist() {
            const datalist = document.getElementById('batchOptions'); datalist.innerHTML = '';
            [...new Set(groupData.map(i => i.batch))].filter(b => b).forEach(b => { let option = document.createElement('option'); option.value = b; datalist.appendChild(option); });
        }
