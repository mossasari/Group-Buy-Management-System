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
                    feedbackHtml = `<div class="text-xs text-green-600 mt-2">团员尚未反馈平铺图查看情况</div>`;
                }

                list.innerHTML += `
                <div class="border border-green-100 bg-green-50 p-4 rounded shadow-sm relative">
                    <div class="flex justify-between items-center border-b border-green-200 pb-2 mb-3">
                        <span class="font-bold text-green-800 text-lg">${req.cn} <span class="text-xs font-normal text-green-600 ml-2">${new Date(req.time).toLocaleString()}</span></span>
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
                    <div class="text-sm space-y-1 mb-3 text-green-800">
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
                    hideLoading(); showToast("该申请已被团员撤销！", 'warning');
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
            } catch(e) { hideLoading(); showToast("操作失败，请检查网络！", 'error'); }
        }

        window.setBatchLocation = function() {
            let batch = document.getElementById('shipAdminBatchSelect').value;
            let location = document.getElementById('shipAdminLocationInput').value.trim();
            if(!batch || !location) { showToast("请正确选择团期，并填写新囤货地！", 'warning'); return; }
            
            let updated = 0;
            groupData.forEach(item => {
                if(item.batch === batch) { item.location = location; updated++; }
            });
            
            if(updated > 0) {
                saveData();
                showToast(`成功将团期 [${batch}] 下的 ${updated} 条数据划入囤货地: [${location}] ！`, 'success');
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
                    showToast("更新失败：该申请刚刚已被团员撤销！", 'warning');
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
                showToast("操作失败，请检查网络！", 'error');
            }
        }            

        // P16: 图床配置独立渲染
        window.renderImageHostConfig = function() {
            let hostConfig = JSON.parse(imageUrlData['__IMAGE_HOST_CONFIG__'] || '{}');
            let html = `
            <div class="flex flex-col gap-2">
                <div><label class="text-xs text-indigo-600">图床 API 地址</label><input type="text" id="host_api_url" value="${hostConfig.api || ''}" placeholder="https://your-image-host.example.com/api" class="w-full border border-gray-300 focus:border-indigo-500 rounded px-2 py-1 text-sm"></div>
                <div><label class="text-xs text-indigo-600">表单字段名 (默认: image)</label><input type="text" id="host_field" value="${hostConfig.field || ''}" placeholder="image" class="w-full border border-gray-300 focus:border-indigo-500 rounded px-2 py-1 text-sm"></div>
                <div><label class="text-xs text-indigo-600">API Token/密钥 (可选)</label><input type="text" id="host_token" value="${hostConfig.token || ''}" placeholder="留空则不使用认证" class="w-full border border-gray-300 focus:border-indigo-500 rounded px-2 py-1 text-sm"></div>
                <div><label class="text-xs text-indigo-600">响应中图片URL的JSON路径 (可选，例: data.links.url)</label><input type="text" id="host_resp_path" value="${hostConfig.respPath || ''}" placeholder="留空则自动识别" class="w-full border border-gray-300 focus:border-indigo-500 rounded px-2 py-1 text-sm"></div>
            </div>`;
            document.getElementById('cloudImageHostConfig').innerHTML = html;
        };

        // P16: 图床配置独立保存
        window.saveImageHostConfig = async function() {
            let hostApi = document.getElementById('host_api_url').value.trim();
            let hostField = document.getElementById('host_field').value.trim();
            let hostToken = document.getElementById('host_token').value.trim();
            let hostRespPath = document.getElementById('host_resp_path').value.trim();
            imageUrlData['__IMAGE_HOST_CONFIG__'] = JSON.stringify({ api: hostApi, field: hostField, token: hostToken, respPath: hostRespPath });
            saveImageUrlData();
            showToast('图床配置保存成功！', 'success');
        };

        window.renderLocationSettings = function() {
            let locs = [...new Set(groupData.map(i => i.location))].filter(l => l);
            let settings = JSON.parse(imageUrlData['__LOCATION_SETTINGS__'] || '{}');
            let html = '';
            if(locs.length === 0) { html += '<p class="text-sm text-gray-500 text-center mt-4">暂无囤货地数据，请先在排发工作台给谷子设置囤货地。</p>'; }
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
        };

        // 兼容旧调用: 一次渲染所有云端设置
        window.renderCloudSettings = function() {
            renderImageHostConfig();
            renderLocationSettings();
        };

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
            showToast('邮费配置保存成功！', 'success');
        }

        // P15: 计算图片平均亮度，返回建议遮罩透明度
        window.calcOverlayOpacity = function(imgUrl, callback) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                const c = document.createElement('canvas');
                const s = 10; // 10x10 采样
                c.width = s; c.height = s;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0, s, s);
                const data = ctx.getImageData(0, 0, s, s).data;
                let sum = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) { sum += (data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114); count++; }
                const avg = sum / count; // 0-255
                // 亮图(>128) → 深遮罩 0.5, 暗图(<128) → 浅遮罩 0.25
                const opacity = avg > 160 ? 0.55 : avg > 128 ? 0.45 : avg > 80 ? 0.35 : 0.2;
                callback(opacity);
            };
            img.onerror = function() { callback(0.4); }; // fallback
            img.src = imgUrl;
        };

        // P15: 背景配置渲染
        window.renderBgConfig = function() {
            let config = JSON.parse(imageUrlData['__APP_CONFIG__'] || '{}');
            let bgType = config.bgType || 'none';
            let bgColor = config.bgColor || '#f3f4f6';
            let bgUrl = config.bgUrl || '';
            let bgOpacity = config.bgOpacity || 0.4;
            let html = `
            <div class="flex flex-col gap-3">
                <div><label class="text-xs text-pink-600">背景类型</label>
                    <select id="bgTypeSelect" onchange="document.getElementById('bgColorRow').style.display=this.value==='color'?'block':'none';document.getElementById('bgImageRow').style.display=this.value==='image'?'block':'none';" class="w-full border rounded px-2 py-1.5 text-sm">
                        <option value="none" ${bgType==='none'?'selected':''}>默认灰色</option>
                        <option value="color" ${bgType==='color'?'selected':''}>纯色背景</option>
                        <option value="image" ${bgType==='image'?'selected':''}>图片背景</option>
                    </select>
                </div>
                <div id="bgColorRow" style="display:${bgType==='color'?'block':'none'}">
                    <label class="text-xs text-pink-600">背景颜色</label>
                    <div class="flex gap-2 items-center">
                        <input type="color" id="bgColorInput" value="${bgColor}" class="w-10 h-10 border rounded cursor-pointer">
                        <input type="text" id="bgColorText" value="${bgColor}" oninput="document.getElementById('bgColorInput').value=this.value" class="flex-1 border rounded px-2 py-1 text-sm">
                    </div>
                </div>
                <div id="bgImageRow" style="display:${bgType==='image'?'block':'none'}">
                    <label class="text-xs text-pink-600">背景图片（自动添加遮罩）</label>
                    <div class="flex gap-2 items-center">
                        <input type="text" id="bgUrlInput" value="${bgUrl}" placeholder="粘贴图床直链..." class="flex-1 border rounded px-2 py-1 text-sm">
                        <input type="file" accept="image/*" onchange="handleBgUpload(this)" class="hidden" id="bgFileInput">
                        <button onclick="document.getElementById('bgFileInput').click()" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded hover:bg-indigo-200 font-bold">📤 上传</button>
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                        <label class="text-xs text-pink-600">遮罩透明度:</label>
                        <input type="range" id="bgOverlaySlider" min="0" max="60" value="${Math.round(bgOpacity*100)}" class="flex-1">
                        <span id="bgOverlayLabel" class="text-xs text-pink-600 w-8">${Math.round(bgOpacity*100)}%</span>
                    </div>
                    <div id="bgPreviewArea" class="mt-2 ${bgUrl?'':'hidden'}">
                        <p class="text-xs text-pink-500 mb-1">预览（含遮罩效果）:</p>
                        <div id="bgPreviewBox" style="width:100%;height:80px;background:${bgColor} url(${bgUrl}) center/cover;position:relative;border-radius:4px;border:1px solid #ddd;">
                            <div style="position:absolute;inset:0;background:rgba(0,0,0,${bgOpacity});border-radius:4px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.getElementById('cloudBgConfig').innerHTML = html;
            document.getElementById('bgOverlaySlider')?.addEventListener('input', function() {
                document.getElementById('bgOverlayLabel').textContent = this.value + '%';
                const previewBox = document.getElementById('bgPreviewBox');
                if(previewBox) { const overlay = previewBox.querySelector('div'); overlay.style.background = `rgba(0,0,0,${this.value/100})`; }
            });
        };

        // P15: 上传背景图 → 图床 → 自动计算遮罩
        window.handleBgUpload = function(inputEl) {
            const file = inputEl.files[0]; if (!file) return;
            showLoading('上传背景图中...');
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image(); img.src = e.target.result;
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height, MAX = 1200;
                    if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
                    else if (h > MAX) { w *= MAX / h; h = MAX; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.7);
                    const remoteUrl = await uploadToImageHost(compressed);
                    hideLoading();
                    if (remoteUrl) {
                        document.getElementById('bgUrlInput').value = remoteUrl;
                        document.getElementById('bgPreviewArea').classList.remove('hidden');
                        calcOverlayOpacity(remoteUrl, function(opacity) {
                            document.getElementById('bgOverlaySlider').value = Math.round(opacity * 100);
                            document.getElementById('bgOverlayLabel').textContent = Math.round(opacity * 100) + '%';
                            updateBgPreview(remoteUrl, opacity);
                        });
                        showToast('背景图上传成功！', 'success');
                    } else {
                        showToast('背景图上传失败！', 'error');
                    }
                    inputEl.value = '';
                };
            };
        };

        function updateBgPreview(url, opacity) {
            const box = document.getElementById('bgPreviewBox');
            if (box) {
                box.style.backgroundImage = `url(${url})`;
                box.querySelector('div').style.background = `rgba(0,0,0,${opacity})`;
            }
        }

        // P15: 保存背景配置
        window.saveBgConfig = async function() {
            let config = JSON.parse(imageUrlData['__APP_CONFIG__'] || '{}');
            config.bgType = document.getElementById('bgTypeSelect').value;
            config.bgColor = document.getElementById('bgColorText')?.value || '#f3f4f6';
            config.bgUrl = document.getElementById('bgUrlInput')?.value || '';
            config.bgOpacity = parseInt(document.getElementById('bgOverlaySlider')?.value || '40') / 100;
            imageUrlData['__APP_CONFIG__'] = JSON.stringify(config);
            saveImageUrlData();
            if (typeof applyBackground === 'function') applyBackground();
            showToast('背景配置保存成功！', 'success');
        };

        window.updateBgPreview = updateBgPreview;

        // P12: 功能开关渲染
        window.renderFeatureToggles = function() {
            let config = JSON.parse(imageUrlData['__APP_CONFIG__'] || '{}');
            let features = config.features || {};
            let piggyOn = features.piggyRank !== false; // 默认 true
            var intlOn = features.intlFreight !== false;
            var html = `
            <div class="space-y-3">
                <div class="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                        <p class="font-bold text-sm">🐷 ！？猪猪？！</p>
                        <p class="text-xs text-amber-600">首页"吃谷成就排名"入口</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggle_piggyRank" ${piggyOn ? 'checked' : ''} class="sr-only peer">
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                        <p class="font-bold text-sm">🌍 国际运费计算 & 排发表</p>
                        <p class="text-xs text-amber-600">仪表盘"国际运费"入口</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="toggle_intlFreight" ${intlOn ? 'checked' : ''} class="sr-only peer">
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                </div>
            </div>`;
            document.getElementById('cloudFeatureToggles').innerHTML = html;
        };

        // P12: 保存功能开关
        window.saveFeatureToggles = async function() {
            let config = JSON.parse(imageUrlData['__APP_CONFIG__'] || '{}');
            if (!config.features) config.features = {};
            config.features.piggyRank = document.getElementById('toggle_piggyRank').checked;
            config.features.intlFreight = document.getElementById('toggle_intlFreight').checked;
            imageUrlData['__APP_CONFIG__'] = JSON.stringify(config);
            saveImageUrlData();
            if (typeof applyFeatureToggles === 'function') applyFeatureToggles();
            showToast('功能开关保存成功！', 'success');
        };

        // P12: 应用功能开关到DOM
        window.applyFeatureToggles = function() {
            var piggyBtn = document.querySelector('#portal-screen button[onclick*="rank-screen"]');
            if (piggyBtn) piggyBtn.style.display = isFeatureEnabled('piggyRank') ? '' : 'none';
            var intlTab = document.getElementById('tab-intl-freight');
            if (intlTab) intlTab.style.display = isFeatureEnabled('intlFreight') ? '' : 'none';
        };

        window.openReuseImageModal = function() {
            const currentBatch = document.getElementById('imageBatchSelect').value;
            if(!currentBatch) { showToast('请先选择当前需要补充柄图的团期！', 'warning'); return; }
            
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b && b !== currentBatch);
            if(batches.length === 0) { showToast('没有其他历史团期可供复用！', 'warning'); return; }
            
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
                showToast("成功复用了 " + count + " 张同名款式的柄图！", 'success');
            } else {
                showToast('未找到可以复用的柄图。(可能是该历史团期没有同名角色，或者当前团期已经有图了)', 'warning');
            }
            closeReuseImageModal();
        };
