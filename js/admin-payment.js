        // ================= 团长端交肾管理 =================
        window.updatePayAdminCodeDisplay = function() {
            let batch = document.getElementById('payAdminBatchSelect').value;
            let settings = JSON.parse(imageUrlData['__PAYMENT_SETTINGS__'] || '{}');
            document.getElementById('payAdminCodeInput').value = settings[batch] || '';
        };

        window.renderPaymentAdmin = function() {
            const batchSelect = document.getElementById('payAdminBatchSelect');
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b);
            if(batchSelect) batchSelect.innerHTML = batches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
            
            updatePayAdminCodeDisplay();
            let settings = JSON.parse(imageUrlData['__PAYMENT_SETTINGS__'] || '{}');
            document.getElementById('payAdminDefaultCodeInput').value = settings['__DEFAULT__'] || '';

            let reqs = JSON.parse(imageUrlData['__PAYMENT_REQS__'] || '[]'); 
            const list = document.getElementById('paymentAdminList'); list.innerHTML = '';
            if(reqs.length === 0) { list.innerHTML = '<p class="text-gray-400 text-sm">暂无交肾申请</p>'; return; }
            let now = Date.now(); let needSave = false;
            reqs.forEach(r => { if (r.proofImg && (now - r.time > 7 * 24 * 3600 * 1000)) { delete r.proofImg; needSave = true; } });
            if (needSave) { imageUrlData['__PAYMENT_REQS__'] = JSON.stringify(reqs); saveImageUrlData(); }
            reqs.slice().reverse().forEach(req => {
                let badge = req.status==='待审核'?'text-yellow-600':req.status==='审核通过'?'text-green-600':'text-red-500';
                let btnHtml = req.status === '待审核' ? `<div class="flex gap-2 mt-3"><button onclick="approvePayment('${req.id}')" class="flex-1 bg-green-500 text-white font-bold py-1.5 rounded hover:bg-green-600">✅ 确认已交款</button><button onclick="rejectPayment('${req.id}')" class="flex-1 bg-red-100 text-red-600 font-bold py-1.5 rounded hover:bg-red-200 border border-red-200">❌ 驳回</button></div>` : `<div class="mt-3 text-sm font-bold ${badge} text-center bg-gray-50 py-1.5 rounded border">状态: ${req.status}<button onclick="deletePaymentReq('${req.id}')" class="ml-4 text-xs text-gray-400 hover:text-red-500 underline font-normal">删除记录</button></div>`;
                list.innerHTML += `<div class="border border-yellow-200 bg-white p-4 rounded shadow-sm mb-3"><div class="flex justify-between items-center border-b pb-2 mb-2"><span class="font-bold text-gray-800 text-lg">${req.cn}</span><span class="text-xs text-gray-500">${new Date(req.time).toLocaleString()}</span></div><div class="text-sm space-y-1 mb-2"><p><strong>团期：</strong>${req.batch}</p><p><strong>应交金额：</strong><span class="text-red-500 font-bold text-lg">¥${req.amount.toFixed(2)}</span></p><p><strong>买家留言：</strong>${req.remark || '无'}</p><p><strong>涉及谷子：</strong>共 ${req.items.length} 项</p></div>${req.proofImg ? `<img src="${req.proofImg}" class="w-full max-h-48 object-contain rounded border shadow-sm cursor-pointer bg-gray-50" onclick="window.open(this.src)">` : '<div class="text-xs text-gray-400 text-center py-4 bg-gray-50 border rounded">截图已过期或未上传</div>'}${btnHtml}</div>`;
            });
        }

        window.setBatchPayCode = function() {
            let batch = document.getElementById('payAdminBatchSelect').value; let codeUrl = document.getElementById('payAdminCodeInput').value.trim();
            if(!batch) { showToast("请选择团期！", 'warning'); return; }
            let settings = JSON.parse(imageUrlData['__PAYMENT_SETTINGS__'] || '{}'); settings[batch] = codeUrl;
            imageUrlData['__PAYMENT_SETTINGS__'] = JSON.stringify(settings); saveImageUrlData();
            showToast(`团期 [${batch}] 的专用收款码设置成功！`, 'success');
        }

        window.setDefaultPayCode = function() {
            let codeUrl = document.getElementById('payAdminDefaultCodeInput').value.trim();
            let settings = JSON.parse(imageUrlData['__PAYMENT_SETTINGS__'] || '{}');
            settings['__DEFAULT__'] = codeUrl;
            imageUrlData['__PAYMENT_SETTINGS__'] = JSON.stringify(settings); saveImageUrlData();
            showToast(`全局默认收款码设置成功！`, 'success');
        }

        window.approvePayment = async function(reqId) {
            if(!confirm('确认该团员已交款？\n确认后，他申请的这批谷子状态将全部自动变为"已交"！')) return;
            showLoading("审批中...");
            try {
                let reqs = JSON.parse(imageUrlData['__PAYMENT_REQS__'] || '[]'); let target = reqs.find(r => r.id === reqId);
                if(target) {
                    target.status = '审核通过';
                    groupData.forEach(item => { if(target.items.includes(item.id)) item.paidStatus = '已交'; });
                    imageUrlData['__PAYMENT_REQS__'] = JSON.stringify(reqs);
                    saveDataLocalOnly(); await syncToCloud(); renderPaymentAdmin();
                    if(document.getElementById('page-manage').classList.contains('hidden') === false) renderManageTable();
                    hideLoading(); showToast("审批通过，相关谷子已自动更新为【已交】状态！", 'success');
                }
            } catch(e) { hideLoading(); showToast("审批失败！", 'error'); }
        }

        window.rejectPayment = async function(reqId) {
            let reason = prompt('请输入驳回原因 (团员可见):', '截图模糊或金额不对'); if(reason === null) return;
            showLoading("驳回中...");
            try {
                let reqs = JSON.parse(imageUrlData['__PAYMENT_REQS__'] || '[]'); let target = reqs.find(r => r.id === reqId);
                if(target) { target.status = '被驳回'; target.remark = reason; imageUrlData['__PAYMENT_REQS__'] = JSON.stringify(reqs); saveImageUrlData(); renderPaymentAdmin(); hideLoading(); }
            } catch(e) { hideLoading(); showToast("操作失败！", 'error'); }
        }

        window.deletePaymentReq = function(reqId) {
            if(!confirm('确定要删除这条申请记录吗？(仅删除记录，不影响谷子状态)')) return;
            dismissedReqIds.add(reqId);
            let reqs = JSON.parse(imageUrlData['__PAYMENT_REQS__'] || '[]'); reqs = reqs.filter(r => r.id !== reqId);
            imageUrlData['__PAYMENT_REQS__'] = JSON.stringify(reqs); saveImageUrlData(); renderPaymentAdmin();
        }
