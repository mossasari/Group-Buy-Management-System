        function switchTab(tabId) {
            document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
            document.getElementById('page-' + tabId).classList.remove('hidden');
            document.querySelectorAll('[id^="tab-"]').forEach(el => { el.classList.remove('tab-active', 'text-blue-500', 'text-purple-500', 'text-green-600', 'text-yellow-600'); el.classList.add('text-gray-500'); el.style.borderBottom = "none"; el.style.fontWeight = "normal"; });
            let activeTab = document.getElementById('tab-' + tabId);
            if(tabId === 'cloud') { activeTab.classList.add('tab-active', 'text-purple-500'); activeTab.style.borderBottom = "2px solid #a855f7"; renderCloudSettings(); renderBgConfig(); renderFeatureToggles(); }
            else if(tabId === 'shipping') { activeTab.classList.add('tab-active', 'text-green-600'); activeTab.style.borderBottom = "2px solid #16a34a"; renderShippingAdmin(); }
            else if(tabId === 'payment') { activeTab.classList.add('tab-active', 'text-yellow-600'); activeTab.style.borderBottom = "2px solid #ca8a04"; renderPaymentAdmin(); }
            else { activeTab.classList.add('tab-active', 'text-blue-500'); activeTab.style.borderBottom = "2px solid #3b82f6"; }
            activeTab.classList.remove('text-gray-500'); activeTab.style.fontWeight = "600";
            if (tabId === 'manage') { updateSidebar(); renderManageTable(); }
            if (tabId === 'schedule') { initScheduleFilters(); }
            if (tabId === 'finance') { updateFinanceSelect(); renderFinanceTable(); }
            if (tabId === 'images') { initImageManager(); }
        }

        let currentBatchImageContext = { batch: '', cat: '' };
        function initImageManager() {
            const batchSelect = document.getElementById('imageBatchSelect');
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b);
            batchSelect.innerHTML = batches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
            if(batches.length > 0) renderImageManager(); else document.getElementById('imageContainer').innerHTML = '<p class="text-center py-8">暂无数据</p>';
        }
        window.renderImageManager = function() {
            const batch = document.getElementById('imageBatchSelect').value; const container = document.getElementById('imageContainer');
            container.innerHTML = ''; if(!batch) return;
            let data = groupData.filter(i => i.batch === batch);
            [...new Set(data.map(i => i.category))].filter(c => c).forEach(cat => {
                let html = `<div class="mb-6"><div class="flex items-center justify-between bg-gray-100 p-2 mb-3 border-l-4 border-blue-500"><h3 class="font-bold text-gray-800">${escapeHtml(cat)}</h3><button onclick="openBatchImageModal('${escapeHtml(batch)}', '${escapeHtml(cat)}')" class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 font-bold transition shadow-sm">➕ 批量导入链接</button></div><div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">`;
                [...new Set(data.filter(i => i.category === cat).map(i => i.character))].filter(c => c).forEach(char => {
                    let key = `${batch}|${cat}|${char}`; let imgUrl = imageUrlData[key];
                    let imgHtml = imgUrl ? `<img src="${imgUrl}" class="w-full aspect-[4/3] object-cover bg-white rounded shadow-sm border border-gray-200">` : `<div class="w-full aspect-[4/3] bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400"><span>🔗</span></div>`;
                    html += `<div class="flex flex-col relative group cursor-pointer" onclick="openImageModal('${key}')">${imgHtml}${imgUrl ? `<button onclick="deleteImage('${key}', event)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm shadow">×</button>` : ''}<div class="text-center text-xs text-gray-700 mt-1 truncate" title="${escapeHtml(char)}">${escapeHtml(char)}</div></div>`;
                });
                container.innerHTML += html + `</div></div>`;
            });
        }
        window.openImageModal = function(key) { currentEditImageKey = key; document.getElementById('imgUrlInput').value = imageUrlData[key] || ''; document.getElementById('imageUrlModal').classList.remove('hidden'); };
        window.closeImageModal = function() { document.getElementById('imageUrlModal').classList.add('hidden'); };
        window.saveImageUrl = function() { const url = document.getElementById('imgUrlInput').value.trim(); if(url) imageUrlData[currentEditImageKey] = url; else delete imageUrlData[currentEditImageKey]; saveImageUrlData(); closeImageModal(); renderImageManager(); };
        window.deleteImage = function(key, event) { event.stopPropagation(); showConfirmModal('确定删除这张柄图？').then(function(ok) { if(ok) { var deleted = imageUrlData[key]; delete imageUrlData[key]; saveImageUrlData(); renderImageManager(); showUndoToast('柄图已删除', function() { imageUrlData[key] = deleted; saveImageUrlData(); renderImageManager(); showToast('柄图已恢复', 'success'); }); } }); };

        window.openBatchImageModal = function(batch, cat) {
            currentBatchImageContext = { batch, cat };
            document.getElementById('batchImageTitle').innerText = `批量导入 - ${batch} / ${cat}`;
            document.getElementById('batchImageText').value = '';
            document.getElementById('batchImageModal').classList.remove('hidden');
        };
        window.closeBatchImageModal = function() { document.getElementById('batchImageModal').classList.add('hidden'); };
        window.saveBatchImage = function() {
            let text = document.getElementById('batchImageText').value.trim();
            if(!text) return closeBatchImageModal();
            let lines = text.split(/[\r\n]+/);
            let updated = 0;
            lines.forEach(line => {
                let parts = line.split(/[,，\t]/);
                if(parts.length < 2) {
                    let lastSpace = line.lastIndexOf('http');
                    if (lastSpace > 0) parts = [line.substring(0, lastSpace).trim(), line.substring(lastSpace).trim()];
                    else parts = line.split(/\s+/);
                }
                if (parts.length >= 2) {
                    let actualUrl = parts[parts.length - 1].trim();
                    let actualChar = parts.slice(0, parts.length - 1).join('').trim();
                    let key = `${currentBatchImageContext.batch}|${currentBatchImageContext.cat}|${actualChar}`;
                    if(actualUrl.startsWith('http')) { imageUrlData[key] = actualUrl; updated++; }
                }
            });
            saveImageUrlData(); closeBatchImageModal(); renderImageManager();
            if(updated > 0) showToast(`成功导入 ${updated} 个柄图链接！`, 'success'); else showToast("未能识别到任何链接，请检查格式 (角色名,http链接)。", 'warning');
        };

        document.getElementById('itemForm').addEventListener('submit', function(e) {
            e.preventDefault();
            var batch = document.getElementById('inBatch'), category = document.getElementById('inCategory'), character = document.getElementById('inCharacter'), price = document.getElementById('inPrice'), names = document.getElementById('inCNs');
            var valid = true;
            [batch, category, character].forEach(function(f) { if(!f.value.trim()) { f.classList.add('input-error'); valid = false; } else { f.classList.remove('input-error'); } });
            if(!price.value || parseFloat(price.value) <= 0) { price.classList.add('input-error'); valid = false; } else { price.classList.remove('input-error'); }
            if(!names.value.trim() || names.value.split(/[\r\n]+/).filter(function(n) { return n.trim(); }).length === 0) { names.classList.add('input-error'); valid = false; } else { names.classList.remove('input-error'); }
            if(!valid) { showToast('请填写所有必填字段！', 'warning'); return; }
            var batchVal = batch.value.trim(), categoryVal = category.value.trim(), characterVal = character.value.trim(), priceVal = parseFloat(price.value), multiplier = parseInt(document.getElementById('inMultiplier').value) || 1, nameList = names.value.split(/[\r\n]+/).map(function(n) { return n.trim(); }).filter(function(n) { return n !== ''; });
            var countMap = {}; nameList.forEach(function(n) { countMap[n] = (countMap[n] || 0) + multiplier; });
            for (var cn in countMap) groupData.push({ id: generateSafeId(), batch: batchVal, category: categoryVal, character: characterVal, price: priceVal, count: countMap[cn], cn: cn, status: '未到货', paidStatus: '未交' });
            saveData(); character.value = ''; names.value = ''; updateSidebar(); renderManageTable(); showToast("录入成功！", 'success');
        });

        window.handleDragStart = function(e, id) { draggedItemRowId = id; e.dataTransfer.effectAllowed = 'move'; e.target.classList.add('dragging'); };
        window.handleDragOver = function(e) { e.preventDefault(); const targetTr = e.target.closest('tr'); if (targetTr && targetTr.dataset.id !== draggedItemRowId) targetTr.classList.add('drag-over'); };
        window.handleDragLeave = function(e) { const targetTr = e.target.closest('tr'); if (targetTr) targetTr.classList.remove('drag-over'); };
        window.handleDrop = function(e, targetId) {
            e.preventDefault(); const targetTr = e.target.closest('tr'); if (targetTr) targetTr.classList.remove('drag-over');
            if (!draggedItemRowId || draggedItemRowId === targetId) return;
            let sourceIdx = groupData.findIndex(i => i.id === draggedItemRowId);
            let targetIdx = groupData.findIndex(i => i.id === targetId);
            if (sourceIdx === -1 || targetIdx === -1) return;
            let [movedItem] = groupData.splice(sourceIdx, 1);
            targetIdx = groupData.findIndex(i => i.id === targetId); 
            groupData.splice(targetIdx, 0, movedItem);
            saveData(); renderManageTable();
        };
        window.handleDragEnd = function(e) { e.target.classList.remove('dragging'); document.querySelectorAll('tr').forEach(tr => tr.classList.remove('drag-over')); draggedItemRowId = null; };

        function initScheduleFilters() {
            const batchSelect = document.getElementById('scheduleBatch');
            const batches = [...new Set(groupData.map(i => i.batch))].filter(b => b);
            batchSelect.innerHTML = batches.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
            if(batches.length > 0) updateScheduleCategory();
        }
        window.updateScheduleCategory = function() {
            const batch = document.getElementById('scheduleBatch').value;
            const categorySelect = document.getElementById('scheduleCategory');
            const categories = [...new Set(groupData.filter(i => i.batch === batch).map(i => i.category))].filter(c => c);
            categorySelect.innerHTML = '<option value="all">全部种类</option>' + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
            renderSchedule();
        }
        window.updateCategoryStep = function(category, value) { window.scheduleSteps[category] = parseInt(value); renderSchedule(); }
        window.updateCategoryCols = function(category, value) { window.scheduleCols[category] = parseInt(value); renderSchedule(); }
        
        window.renderSchedule = function() {
            const container = document.getElementById('scheduleContainer');
            const batch = document.getElementById('scheduleBatch').value;
            const category = document.getElementById('scheduleCategory').value;
            container.innerHTML = ''; if(!batch) return;
            let data = groupData.filter(i => i.batch === batch);
            let categoriesToRender = category === 'all' ? [...new Set(data.map(i => i.category))].filter(c=>c) : [category];

            categoriesToRender.forEach(cat => {
                let catData = data.filter(i => i.category === cat);
                if(catData.length === 0) return;
                
                let step = window.scheduleSteps[cat] || 1;
                let maxCols = window.scheduleCols[cat] || 12; 
                
                let charMap = {}; 
                catData.forEach(item => {
                    if(!charMap[item.character]) charMap[item.character] = { price: item.price, buyers: [] };
                    let requiredRows = Math.ceil(item.count / step);
                    for(let i = 0; i < requiredRows; i++) charMap[item.character].buyers.push(item.cn);
                });
                
                let chars = Object.keys(charMap);
                if(chars.length === 0) return;

                let charChunks = [];
                for (let i = 0; i < chars.length; i += maxCols) { 
                    charChunks.push(chars.slice(i, i + maxCols));
                }

                let html = `
                    <div class="border-2 border-gray-200 shadow rounded p-2 md:p-4 mb-8 bg-white overflow-hidden export-wrapper">
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded mb-4 shadow-sm border border-gray-100 flex-wrap gap-2">
                            <h3 class="text-lg font-bold text-gray-800">${escapeHtml(batch)} - ${escapeHtml(cat)} 排表</h3>
                            <div class="flex flex-wrap items-center gap-4">
                                <div class="flex items-center gap-2">
                                    <label class="text-xs text-gray-500">每排款式数(列数):</label>
                                    <input type="number" min="1" value="${maxCols}" onchange="updateCategoryCols('${escapeHtml(cat)}', this.value)" class="w-16 border border-gray-300 rounded px-2 py-1 text-sm bg-yellow-50 text-yellow-700 focus:outline-none focus:border-yellow-400">
                                </div>
                                <div class="flex items-center gap-2">
                                    <label class="text-xs text-gray-500">每行数量:</label>
                                    <input type="number" min="1" value="${step}" onchange="updateCategoryStep('${escapeHtml(cat)}', this.value)" class="w-16 border border-gray-300 rounded px-2 py-1 text-sm bg-blue-50 text-blue-700 focus:outline-none focus:border-blue-400">
                                </div>
                            </div>
                        </div>
                `;

                charChunks.forEach((chunk, chunkIndex) => {
                    let maxLen = Math.max(0, ...chunk.map(c => charMap[c].buyers.length));
                    html += `
                        <div class="overflow-x-auto export-scroll-target ${chunkIndex > 0 ? 'mt-6 pt-4 border-t border-dashed border-gray-300' : ''}">
                            <table class="min-w-full text-sm text-center border-collapse border border-gray-300">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="border border-gray-300 py-2 w-12 text-gray-600 font-normal">序号</th>
                                        ${chunk.map(c => `<th class="border border-gray-300 py-2 min-w-[80px]">${escapeHtml(c)}<br><span class="text-xs text-blue-600 font-normal">¥${charMap[c].price}</span></th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    for(let r=0; r<maxLen; r++) {
                        let indexStr = (r + 1) * step;
                        html += `<tr><td class="border border-gray-300 py-1.5 px-1 bg-gray-50 text-gray-500 font-bold">${indexStr}</td>`;
                        chunk.forEach(c => {
                            let buyer = charMap[c].buyers[r] || '';
                            html += `<td class="border border-gray-300 py-1.5 px-1 ${buyer ? 'text-gray-700' : 'bg-gray-50'}">${escapeHtml(buyer)}</td>`;
                        });
                        html += `</tr>`;
                    }
                    html += `</tbody></table></div>`;
                });
                html += `</div>`;
                container.innerHTML += html;
            });
        }

        function updateFinanceSelect() {
            const select = document.getElementById('financeBatchSelect');
            select.innerHTML = '<option value="all">全部团期汇总</option>';
            [...new Set(groupData.map(i => i.batch))].forEach(b => select.innerHTML += `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`);
        }
        
        // 🌟 升级：智能多栏分流肾表渲染逻辑
        window.renderFinanceTable = function() {
            const filter = document.getElementById('financeBatchSelect').value;
            const tbody = document.getElementById('financeTableBody');
            const tfoot = document.getElementById('financeTableFoot');
            tbody.innerHTML = ''; tfoot.innerHTML = '';
            
            let data = filter === 'all' ? groupData : groupData.filter(i => i.batch === filter);
            let summary = {}; let grandTotal = 0, grandPaid = 0, grandUnpaid = 0;

            data.forEach(item => {
                if(!summary[item.cn]) summary[item.cn] = { details: {}, total: 0, paid: 0, unpaid: 0 };
                let money = item.price * item.count;
                summary[item.cn].total += money;
                if(item.paidStatus === '已交') summary[item.cn].paid += money; else summary[item.cn].unpaid += money;
                
                let itemName = filter === 'all' ? `[${item.batch}] ${item.category} - ${item.character}` : `${item.category} - ${item.character}`;
                if(!summary[item.cn].details[itemName]) summary[item.cn].details[itemName] = 0;
                summary[item.cn].details[itemName] += item.count;
            });
            
            let sortedCNs = Object.keys(summary).sort((a, b) => a.localeCompare(b, 'zh-CN'));
            sortedCNs.forEach(cn => {
                grandTotal += summary[cn].total; grandPaid += summary[cn].paid; grandUnpaid += summary[cn].unpaid;
                
                let detailKeys = Object.keys(summary[cn].details);
                
                // 🌟 智能分栏：根据吃谷款式种类多少决定展示几列，并动态设定单元格最小宽度
                let colsClass = "grid-cols-1";
                let minWidthClass = "min-w-[280px]"; // 谷子少时保持紧凑
                if (detailKeys.length > 3 && detailKeys.length <= 6) {
                    colsClass = "grid-cols-2";
                    minWidthClass = "min-w-[480px]"; // 开启双列
                } else if (detailKeys.length > 6) {
                    colsClass = "grid-cols-3";
                    minWidthClass = "min-w-[680px]"; // 开启三列
                }
                
                let detailsHtml = `<div class="grid ${colsClass} gap-2 w-full">`;
                detailKeys.forEach(d => {
                    detailsHtml += `
                        <div class="text-[11px] text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 p-1.5 rounded border border-gray-100 flex items-center justify-between gap-2 transition-colors">
                            <span class="truncate pr-1 font-medium" title="${escapeHtml(d)}">• ${escapeHtml(d)}</span>
                            <strong class="text-blue-500 font-bold whitespace-nowrap text-xs">×${summary[cn].details[d]}</strong>
                        </div>`;
                });
                detailsHtml += '</div>';
                
                let tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 transition-colors";
                tr.innerHTML = `
                    <td class="py-3 px-3 text-gray-800 font-bold border-r border-b align-middle">${escapeHtml(cn)}</td>
                    <td class="py-2 px-2 border-r border-b ${minWidthClass} align-middle">${detailsHtml}</td>
                    <td class="py-3 px-3 border-r border-b align-middle">¥${summary[cn].total.toFixed(2)}</td>
                    <td class="py-3 px-3 text-green-600 border-r border-b align-middle">¥${summary[cn].paid.toFixed(2)}</td>
                    <td class="py-3 px-3 ${summary[cn].unpaid > 0 ? 'text-red-500 font-bold' : 'text-gray-400'} border-b align-middle">¥${summary[cn].unpaid.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
            
            if (sortedCNs.length > 0) {
                tfoot.innerHTML = `<tr><td colspan="2" class="py-3 px-3 text-right border-r border-gray-200">当前表格总计：</td><td class="py-3 px-3 border-r border-gray-200">¥${grandTotal.toFixed(2)}</td><td class="py-3 px-3 text-green-600 border-r border-gray-200">¥${grandPaid.toFixed(2)}</td><td class="py-3 px-3 ${grandUnpaid > 0 ? 'text-red-500' : 'text-gray-500'}">¥${grandUnpaid.toFixed(2)}</td></tr>`;
            }
        };

        window.exportToImage = function(containerId, fileNamePrefix) {
            const element = document.getElementById(containerId);
            const btn = event.currentTarget; const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ 生成中 (请勿滑动屏幕)...';
            const scrollContainers = element.querySelectorAll('.overflow-x-auto, .export-scroll-target');
            
            scrollContainers.forEach(el => el.classList.add('export-expand')); 
            element.classList.add('export-expand', 'export-fix'); 

            setTimeout(() => {
                html2canvas(element, { backgroundColor: '#ffffff', scale: 2, useCORS: true }).then(canvas => {
                    const link = document.createElement('a'); link.download = `${fileNamePrefix}_${new Date().getTime()}.png`; link.href = canvas.toDataURL('image/png'); link.click();
                    
                    scrollContainers.forEach(el => el.classList.remove('export-expand')); 
                    element.classList.remove('export-expand', 'export-fix'); 
                    btn.innerHTML = originalText;
                }).catch(err => { 
                    showToast("截图失败", 'error'); 
                    scrollContainers.forEach(el => el.classList.remove('export-expand')); 
                    element.classList.remove('export-expand', 'export-fix'); 
                    btn.innerHTML = originalText; 
                });
            }, 300); 
        };

        document.getElementById('manageTableBody').addEventListener('click', function(e) {
            if(e.target.classList.contains('btn-delete')) {
                let id = e.target.getAttribute('data-id');
                var itemToDel = groupData.find(function(i) { return i.id === id; });
                showConfirmModal('删除后不可恢复并会同步云端，确定要删除？').then(function(ok) {
                    if(ok) { groupData = groupData.filter(function(i) { return i.id !== id; }); saveData(); updateSidebar(); renderManageTable();
                    if(itemToDel) showUndoToast('已删除「' + itemToDel.character + '」', function() { groupData.push(itemToDel); saveData(); updateSidebar(); renderManageTable(); showToast('已恢复', 'success'); }); }
                });
            } else if (e.target.classList.contains('btn-edit')) {
                window.openEditModal(e.target.getAttribute('data-id'));
            }
        });

        window.downloadTemplate = function() {
            let csv = "\uFEFF唯一ID(导入新数据请留空),团期,分类,角色,单价,数量,买家,到货状态(未到货/已到货/已排发),交肾状态(未交/已交),柄图链接\n,示例团期,立牌,阿米娅,35.5,2,小明,未到货,已交,https://s2.loli.net/xxxx.jpg\n";
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = "排单录入模板.csv"; a.click();
        };
        
        window.exportCSV = function() {
            if(groupData.length===0) { showToast('无数据', 'info'); return; }
            let csv = "\uFEFF唯一ID,团期,分类,角色,单价,数量,买家,到货状态,交肾状态,柄图链接\n";
            groupData.forEach(i => { let key = `${i.batch}|${i.category}|${i.character}`; let imgUrl = imageUrlData[key] || ''; csv += `${i.id},${i.batch},${i.category},${i.character},${i.price},${i.count},${i.cn},${i.status},${i.paidStatus||'未交'},${imgUrl}\n`; });
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = "排单云端数据备份.csv"; a.click();
        };

        function parseCSVText(text) {
            let lines = []; let currentLine = []; let currentCell = ''; let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
                let char = text[i]; let nextChar = text[i+1];
                if (inQuotes) {
                    if (char === '"' && nextChar === '"') { currentCell += '"'; i++; }
                    else if (char === '"') { inQuotes = false; }
                    else { currentCell += char; }
                } else {
                    if (char === '"') { inQuotes = true; }
                    else if (char === ',') { currentLine.push(currentCell); currentCell = ''; }
                    else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                        if (char === '\r') i++;
                        currentLine.push(currentCell); lines.push(currentLine); currentLine = []; currentCell = '';
                    } else { currentCell += char; }
                }
            }
            if (currentCell !== '' || currentLine.length > 0) { currentLine.push(currentCell); lines.push(currentLine); }
            return lines;
        }

        window.importFileHandler = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    let arrayRows = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: false, defval: ""});
                    // Ensure all cells are strings for consistent handling downstream
                    arrayRows = arrayRows.map(row => row.map(cell => cell == null ? '' : String(cell)));
                    processImportedData(arrayRows);
                    event.target.value = ''; // 清空选择
                };
                reader.readAsArrayBuffer(file);
            } else {
                // 处理 CSV
                const encoding = document.getElementById('importEncoding').value;
                const reader = new FileReader();
                let actualEncoding = encoding === 'auto' ? 'UTF-8' : encoding;

                reader.onload = function(e) {
                    let text = e.target.result;
                    let arrayRows = parseCSVText(text);
                    processImportedData(arrayRows);
                    event.target.value = '';
                };
                if(actualEncoding === 'auto') { reader.readAsText(file); } 
                else { reader.readAsText(file, actualEncoding); }
            }
        };

        function processImportedData(rows) {
            if(rows.length < 2) { showToast("文件内容为空或格式错误！", 'warning'); return; }
            
            let isMatrix = false;
            if(rows.length >= 4) {
                let r2 = rows[2] || []; let r3 = rows[3] || [];
                if((r2[0] && r2[0].includes("ID")) || (r3[1] && (r3[1].includes("单价") || r3[1].trim() === "单价"))) {
                    isMatrix = true;
                }
            }
            if(!isMatrix) {
                let header = rows[0].join(",");
                if(!header.includes("团期") || !header.includes("买家")) isMatrix = true;
            }

            let newRecords = [];
            let hasNewImage = false;

            if (isMatrix) {
                try {
                    // 智能提取团期名
                    let rawBatchStr = rows[0].find(c => c && String(c).trim() !== '') || '未知团期';
                    let batch = rawBatchStr;
                    let batchMatch = rawBatchStr.match(/【(.*?)】/);
                    if (batchMatch && batchMatch[1]) {
                        batch = batchMatch[1].trim();
                    } else {
                        batch = batch.replace(/,/g, '').trim(); 
                    }
                    
                    let categoryRow = rows[1] || [];
                    let headerRow = rows[2] || [];
                    let priceRow = rows[3] || [];

                    let colCategories = [];
                    let currentCat = '默认分类';
                    let maxCols = Math.max(headerRow.length, categoryRow.length);
                    
                    for (let c = 1; c < maxCols; c++) {
                        let catCell = categoryRow[c] ? String(categoryRow[c]).trim() : '';
                        if (catCell && catCell !== '分类' && catCell !== '') {
                            currentCat = catCell;
                        }
                        colCategories[c] = currentCat; 
                    }

                    for(let col = 1; col < headerRow.length; col++) {
                        let character = headerRow[col] ? String(headerRow[col]).trim() : '';
                        if(!character || character === '种类') continue;

                        let priceStr = priceRow[col] ? String(priceRow[col]).trim() : '0';
                        let price = parseFloat(priceStr) || 0;
                        let category = colCategories[col] || '默认分类';

                        for(let r = 4; r < rows.length; r++) {
                            let row = rows[r];
                            if(!row || row.length < 2) continue;
                            
                            // 自动过滤垃圾行（如包含“总金额”、“昵称/总数”的行）
                            let rowStr = row.join("").toLowerCase();
                            if(rowStr.includes("总金额") || rowStr.includes("昵称/总数")) {
                                continue;
                            }

                            let cn = (row[1] && String(row[1]).trim()) ? String(row[1]).trim() : (row[0] ? String(row[0]).trim() : '');
                            if(!cn || cn.includes('唯一ID')) continue; 

                            let countStr = row[col] ? String(row[col]).trim() : '';
                            if(!countStr) continue;
                            
                            let count = parseInt(countStr);
                            if(isNaN(count) || count <= 0) continue;

                            newRecords.push({
                                id: generateSafeId(),
                                batch: batch,
                                category: category,
                                character: character,
                                price: price,
                                count: count,
                                cn: cn,
                                status: '未到货',
                                paidStatus: '未交'
                            });
                        }
                    }
                } catch(err) {
                    console.error(err);
                    { showToast("矩阵格式解析失败，请检查表格是否符合要求。", 'error'); return; }
                }
            } else {
                let headers = rows[0].map(h => String(h).trim());
                let colMap = {
                    id: headers.findIndex(h => h.includes("ID")),
                    batch: headers.findIndex(h => h.includes("团期")),
                    category: headers.findIndex(h => h.includes("分类") || h.includes("种类")),
                    character: headers.findIndex(h => h.includes("角色") || h.includes("款式")),
                    price: headers.findIndex(h => h.includes("单价")),
                    count: headers.findIndex(h => h.includes("数量")),
                    cn: headers.findIndex(h => h.includes("买家") || h.includes("CN")),
                    status: headers.findIndex(h => h.includes("到货")),
                    paidStatus: headers.findIndex(h => h.includes("交肾") || h.includes("付款")),
                    imgUrl: headers.findIndex(h => h.includes("柄图") || h.includes("链接") || h.includes("图片"))
                };

                for(let i = 1; i < rows.length; i++) {
                    let row = rows[i];
                    if(row.length < 3) continue;
                    let cn = colMap.cn >= 0 ? String(row[colMap.cn]||'').trim() : '';
                    if(!cn) continue;
                    let count = parseInt(row[colMap.count]) || 1;
                    
                    let batch = colMap.batch >=0 ? String(row[colMap.batch]).trim() : '';
                    let category = colMap.category >=0 ? String(row[colMap.category]).trim() : '';
                    let character = colMap.character >=0 ? String(row[colMap.character]).trim() : '';

                    newRecords.push({
                        id: (colMap.id >=0 && row[colMap.id]) ? String(row[colMap.id]).trim() : generateSafeId(),
                        batch: batch,
                        category: category,
                        character: character,
                        price: colMap.price >=0 ? parseFloat(row[colMap.price]) || 0 : 0,
                        count: count,
                        cn: cn,
                        status: colMap.status >=0 ? String(row[colMap.status]).trim() : '未到货',
                        paidStatus: colMap.paidStatus >=0 ? String(row[colMap.paidStatus]).trim() : '未交'
                    });

                    if (colMap.imgUrl >= 0 && row[colMap.imgUrl]) {
                        let url = String(row[colMap.imgUrl]).trim();
                        if (url && batch && category && character) {
                            let key = `${batch}|${category}|${character}`;
                            imageUrlData[key] = url;
                            hasNewImage = true;
                        }
                    }
                }
            }

            if(newRecords.length > 0) {
                groupData.push(...newRecords);
                saveData();
                if (hasNewImage) saveImageUrlData();
                updateSidebar();
                renderManageTable();
                showToast(`成功智能识别并导入 ${newRecords.length} 条排单数据！已同步至云端。`, 'success');
            } else {
                showToast("未能识别到有效数据，请检查表格内容。", 'warning');
            }
        }
