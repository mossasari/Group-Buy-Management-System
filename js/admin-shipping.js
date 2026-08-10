        window.renderShippingAdmin = function(pageIndex = 0) {
            const batchSelect = document.getElementById('shipAdminBatchSelect');
            const datalist = document.getElementById('locationOptions');
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b);
            const locs = [...new Set(groupData.map(i => i.location))].filter(l => l);
            if(batchSelect) batchSelect.innerHTML = batches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
            if(datalist) datalist.innerHTML = locs.map(l => `<option value="${escapeHtml(l)}">`).join('');
            
            updateCurrentLocationDisplay();

            let reqs = JSON.parse(imageUrlData['__SHIPPING_REQS__'] || '[]'); 
            const list = document.getElementById('shippingAdminList'); list.innerHTML = '';
            if(reqs.length === 0) { list.innerHTML = '<p class="text-gray-400 text-sm">暂无排发申请</p>'; return; }
            
            let now = Date.now();
            let needSave = false;
            reqs.forEach(r => {
                if (r.proofImg && (now - r.time > 7 * 24 * 3600 * 1000)) { delete r.proofImg; needSave = true; }
                if (r.buyerProofImg && (now - r.time > 7 * 24 * 3600 * 1000)) { delete r.buyerProofImg; needSave = true; }
            });
            if (needSave) { imageUrlData['__SHIPPING_REQS__'] = JSON.stringify(reqs); saveImageUrlData(); }

            let reversedReqs = reqs.slice().reverse();
            let pageSize = 5;
            let totalPages = Math.ceil(reversedReqs.length / pageSize);
            if(pageIndex >= totalPages) pageIndex = Math.max(0, totalPages - 1);
            let pageReqs = reversedReqs.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

            pageReqs.forEach(req => {
                let itemsHtml = ''; let extraHtml = '';
                req.items.forEach((itemId, idx) => {
                    let g = groupData.find(i=>i.id===itemId);
                    let tag = g ? `<span class="inline-block bg-white border border-gray-200 px-2 py-1 rounded text-xs mr-2 mb-2 shadow-sm">${g.batch}-${g.category}-${g.character} <strong class="text-blue-500">x${g.count}</strong></span>` : `<span class="inline-block bg-red-50 text-xs text-red-400 border border-red-100 px-2 py-1 rounded mr-2 mb-2">已删商品</span>`;
                    if (idx < 6) itemsHtml += tag; else extraHtml += tag;
                });
                
                let toggleBtn = '';
                if (extraHtml !== '') {
                    itemsHtml += `<div id="extra_items_${req.id}" class="hidden mt-1 pt-2 border-t border-dashed border-green-200">${extraHtml}</div>`;
                    toggleBtn = `<button onclick="document.getElementById('extra_items_${req.id}').classList.toggle('hidden')" class="block text-xs text-green-600 bg-green-100 px-2 py-1 rounded hover:bg-green-200 w-full text-center mt-1 font-bold">🔽 展开/收起剩余 ${req.items.length - 6} 项</button>`;
                }

                let proofArea = `
                    <div class="mt-3 p-2 bg-white rounded border border-gray-200 text-xs">
                        <div class="flex justify-between items-center mb-1">
                            <strong class="text-gray-600">📸 排发平铺图 (传给团员看/7天后自动销毁):</strong>
                            ${req.proofImg ? `<button onclick="updateShipAdminReq('${req.id}', 'proofImg', '')" class="text-red-500 hover:underline">删除图片</button>` : ''}
                        </div>
                        ${req.proofImg ? 
                            `<img src="${req.proofImg}" class="w-24 h-24 object-cover rounded border shadow-sm cursor-pointer" onclick="window.open(this.src)">` 
                            : `<input type="file" accept="image/*" onchange="uploadProofImage('${req.id}', this)" class="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">`
                        }
                    </div>
                `;

                let buyerProofArea = req.buyerProofImg ? `
                    <div class="mt-2 mb-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs flex gap-3 items-center">
                        <img src="${req.buyerProofImg}" class="w-16 h-16 object-cover rounded border border-blue-200 shadow-sm cursor-pointer hover:opacity-80" onclick="window.open(this.src)" title="点击查看大图">
                        <div class="text-blue-700 font-bold">团员已上传邮费截图 👉</div>
                    </div>
                ` : '';

                let fStatus = req.buyerFeedbackStatus || '未查看';
                let fRemark = req.buyerFeedbackRemark || '无';
                let feedbackHtml = '';
                
                if (fStatus === '已查看，有问题') {
                    feedbackHtml = `<div class="bg-red-100 border border-red-300 p-2 rounded text-sm mt-2 animate-pulse"><strong class="text-red-700">🚨 团员反馈：有问题！</strong><p class="text-red-600 mt-1">备注：${fRemark}</p></div>`;
                } else if (fStatus === '已查看，无问题') {
                    feedbackHtml = `<div class="bg-green-50 border border-green-200 p-2 rounded text-xs mt-2"><strong class="text-green-700">✅ 团员反馈：已确认无问题</strong><span class="text-green-600 ml-2">备注：${fRemark}</span></div>`;
                } else {
                    feedbackHtml = `<div class="text-xs text-gray-400 mt-2">团员尚未反馈平铺图查看情况</div>`;
                }

                list.innerHTML += `
                <div class="border border-green-100 bg-green-50 p-4 rounded shadow-sm relative">
                    <div class="flex justify-between items-center border-b border-green-200 pb-2 mb-3">
                        <span class="font-bold text-green-800 text-lg">${req.cn} <span class="text-xs font-normal text-gray-500 ml-2">${new Date(req.time).toLocaleString()}</span></span>
                        <div class="flex items-center gap-2">
                            <select onchange="updateShipAdminReq('${req.id}', 'status', this.value)" class="border rounded px-2 py-1 text-sm font-bold ${req.status==='已排发'?'text-green-600 border-green-300':req.status==='需补邮'?'text-red-500 border-red-300':'text-yellow-600 border-yellow-300'}">
                                <option value="处理中" ${req.status==='处理中'?'selected':''}>⏳ 处理中</option>
                                <option value="需补邮" ${req.status==='需补邮'?'selected':''}>💰 需补邮</option>
                                <option value="已排发" ${req.status==='已排发'?'selected':''}>✅ 已排发</option>
                            </select>
                            <button onclick="deleteShipAdminReq('${req.id}')" class="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 px-2 py-1 rounded text-sm transition">删除</button>
                        </div>
                    </div>
                    <div class="mb-3">${itemsHtml}${toggleBtn}</div>
                    ${buyerProofArea}
                    <div class="text-sm space-y-1 mb-3 text-gray-700">
                        <p><strong>是否已付邮费：</strong><span class="${req.isPaid==='是'?'text-green-600':'text-red-500'} font-bold">${req.isPaid}</span></p>
                        <p><strong>收件地址：</strong>${req.address}</p>
                        <p><strong>快递要求：</strong>${req.express || '无'}</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder="填写快递单号" value="${req.trackingNo||''}" onchange="updateShipAdminReq('${req.id}', 'trackingNo', this.value)" class="w-full sm:flex-1 border border-green-200 rounded px-2 py-1.5 text-sm">
                        <input type="text" placeholder="回复团员 (快递要求/补邮金额)" value="${req.remark||''}" onchange="updateShipAdminReq('${req.id}', 'remark', this.value)" class="w-full sm:flex-1 border border-green-200 rounded px-2 py-1.5 text-sm">
                    </div>
                    ${proofArea}
                    ${feedbackHtml}
                </div>`;
            });

            if (totalPages > 1) {
                list.innerHTML += `
                    <div class="mt-4 flex justify-between items-center text-sm bg-white p-3 rounded-lg shadow-sm border border-green-200">
                        <button onclick="window.scrollTo({top: 0, behavior: 'smooth'}); renderShippingAdmin(${pageIndex - 1})" class="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 font-bold transition disabled:opacity-50" ${pageIndex === 0 ? 'disabled' : ''}>上一页</button>
                        <span class="text-gray-600 font-bold">第 ${pageIndex + 1} / ${totalPages} 页</span>
                        <button onclick="window.scrollTo({top: 0, behavior: 'smooth'}); renderShippingAdmin(${pageIndex + 1})" class="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 font-bold transition disabled:opacity-50" ${pageIndex === totalPages - 1 ? 'disabled' : ''}>下一页</button>
                    </div>
                `;
            }
        }

        window.deleteShipAdminReq = async function(reqId) {
            if(!confirm('⚠️ 确定要永久删除这条排发申请吗？\n删除后不可恢复！')) return;
            
            showLoading("同步删除中...");
            try {
                const { data, error } = await db.from('leader_data').select('image_data').eq('user_id', currentUser.id).single();
                if(error) throw error;
                let imgData = data.image_data || {};
                let reqs = JSON.parse(imgData['__SHIPPING_REQS__'] || '[]');
                
                let existing = reqs.find(r => r.id === reqId);
                if(!existing) {
                    hideLoading(); alert("⚠️ 该申请已被团员撤销！");
                } else {
                    reqs = reqs.filter(r => r.id !== reqId);
                    imgData['__SHIPPING_REQS__'] = JSON.stringify(reqs);
                    const { error: updErr } = await db.from('leader_data').update({ image_data: imgData }).eq('user_id', currentUser.id);
                    if(updErr) throw updErr;
                }
                
                imageUrlData['__SHIPPING_REQS__'] = JSON.stringify(reqs);
                saveDataLocalOnly();
                renderShippingAdmin();
                hideLoading();
            } catch(e) { hideLoading(); alert("操作失败，请检查网络！"); }
        }

        window.setBatchLocation = function() {
            let batch = document.getElementById('shipAdminBatchSelect').value;
            let location = document.getElementById('shipAdminLocationInput').value.trim();
            if(!batch || !location) return alert("请正确选择团期，并填写新囤货地！");
            
            let updated = 0;
            groupData.forEach(item => {
                if(item.batch === batch) { item.location = location; updated++; }
            });
            
            if(updated > 0) {
                saveData();
                alert(`✅ 成功将团期 [${batch}] 下的 ${updated} 条数据划入囤货地: [${location}] ！\n已经同步到云端。`);
                renderShippingAdmin(); 
            }
        }

        window.updateShipAdminReq = async function(reqId, field, value) { 
            showLoading("同步更新中...");
            try {
                const { data, error } = await db.from('leader_data').select('image_data').eq('user_id', currentUser.id).single();
                if(error) throw error;
                
                let imgData = data.image_data || {};
                let reqs = JSON.parse(imgData['__SHIPPING_REQS__'] || '[]');
                let target = reqs.find(r => r.id === reqId);

                if(!target) {
                    hideLoading();
                    alert("⚠️ 更新失败：该申请刚刚已被团员撤销！即将刷新列表。");
                    imageUrlData['__SHIPPING_REQS__'] = JSON.stringify(reqs);
                    saveDataLocalOnly();
                    renderShippingAdmin();
                    return;
                }

                target[field] = value;
                imgData['__SHIPPING_REQS__'] = JSON.stringify(reqs);

                if (field === 'status') {
                    let itemsUpdated = false;
                    groupData.forEach(item => {
                        if (target.items.includes(item.id)) {
                            if (value === '已排发' && item.status !== '已排发') {
                                item.status = '已排发'; itemsUpdated = true;
                            } else if (value !== '已排发' && item.status === '已排发') {
                                item.status = '已到货'; itemsUpdated = true;
                            }
                        }
                    });
                    if (itemsUpdated) {
                        await db.from('leader_data').update({ group_data: groupData, image_data: imgData }).eq('user_id', currentUser.id);
                    } else {
                        await db.from('leader_data').update({ image_data: imgData }).eq('user_id', currentUser.id);
                    }
                } else {
                    await db.from('leader_data').update({ image_data: imgData }).eq('user_id', currentUser.id);
                }

                imageUrlData['__SHIPPING_REQS__'] = JSON.stringify(reqs);
                saveDataLocalOnly();
                renderShippingAdmin();
                hideLoading();
            } catch(e) {
                hideLoading();
                alert("操作失败，请检查网络！");
            }
        }            

        window.renderCloudSettings = function() {
            let locs = [...new Set(groupData.map(i => i.location))].filter(l => l);
            let settings = JSON.parse(imageUrlData['__LOCATION_SETTINGS__'] || '{}');
            let html = '';
            if(locs.length === 0) { html = '<p class="text-sm text-gray-400 text-center mt-4">暂无囤货地数据，请先在排发工作台给谷子设置囤货地。</p>'; }
            locs.forEach(loc => {
                let cost = settings[loc]?.cost || '';
                let url = settings[loc]?.url || '';
                html += `
                <div class="border border-purple-200 p-3 rounded bg-white shadow-sm">
                    <h4 class="font-bold text-purple-700 mb-2">🏠 ${escapeHtml(loc)}</h4>
                    <div class="flex flex-col gap-2">
                        <div><label class="text-xs text-gray-500">邮费说明 (例如: 默认10元,偏远15元)</label><input type="text" id="loc_cost_${loc}" value="${cost}" class="w-full border border-gray-300 focus:border-purple-500 rounded px-2 py-1 text-sm"></div>
                        <div><label class="text-xs text-gray-500">收款码直链 (例如: https://xxx.com/a.jpg)</label><input type="text" id="loc_url_${loc}" value="${url}" class="w-full border border-gray-300 focus:border-purple-500 rounded px-2 py-1 text-sm"></div>
                    </div>
                </div>`;
            });
            document.getElementById('cloudLocationSettings').innerHTML = html;
        }

        window.saveLocationSettings = async function() {
            let locs = [...new Set(groupData.map(i => i.location))].filter(l => l);
            let settings = {};
            locs.forEach(loc => {
                settings[loc] = {
                    cost: document.getElementById(`loc_cost_${loc}`).value.trim(),
                    url: document.getElementById(`loc_url_${loc}`).value.trim()
                };
            });
            imageUrlData['__LOCATION_SETTINGS__'] = JSON.stringify(settings);
            saveImageUrlData();
            alert('✅ 囤货地邮费与收款码配置保存成功！');
        }

        window.openReuseImageModal = function() {
            const currentBatch = document.getElementById('imageBatchSelect').value;
            if(!currentBatch) return alert('请先选择当前需要补充柄图的团期！');
            
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b && b !== currentBatch);
            if(batches.length === 0) return alert('没有其他历史团期可供复用！');
            
            const select = document.getElementById('reuseSourceBatch');
            select.innerHTML = batches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
            
            document.getElementById('reuseImageModal').classList.remove('hidden');
        };

        window.closeReuseImageModal = function() {
            document.getElementById('reuseImageModal').classList.add('hidden');
        };

        window.applyReuseImages = function() {
            const sourceBatch = document.getElementById('reuseSourceBatch').value;
            const targetBatch = document.getElementById('imageBatchSelect').value;
            if(!sourceBatch || !targetBatch) return;

            let count = 0;
            const targetItems = groupData.filter(i => i.batch === targetBatch);
            
            targetItems.forEach(item => {
                const sourceKey = `${sourceBatch}|${item.category}|${item.character}`;
                const targetKey = `${targetBatch}|${item.category}|${item.character}`;
                
                if(imageUrlData[sourceKey] && !imageUrlData[targetKey]) {
                    imageUrlData[targetKey] = imageUrlData[sourceKey];
                    count++;
                }
            });

            if(count > 0) {
                saveImageUrlData(); 
                renderImageManager(); 
                alert("✅ 成功复用了 " + count + " 张同名款式的柄图！");
            } else {
                alert('未找到可以复用的柄图。\n(可能是该历史团期没有同名角色，或者当前团期已经有图了)');
            }
            closeReuseImageModal();
        };
