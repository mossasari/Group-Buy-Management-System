        let shipExportTreeData = {};
        
        window.openShipExportModal = function() {
            if(window.currentShipSelectedIds.size === 0) { showToast('请先勾选需要导出的谷子哦！', 'warning'); return; }
            
            shipExportTreeData = {};
            window.currentShipSelectedIds.forEach(id => {
                let item = currentShipData.items.find(i => i.id === id);
                if(item) {
                    if(!shipExportTreeData[item.batch]) shipExportTreeData[item.batch] = [];
                    shipExportTreeData[item.batch].push(item);
                }
            });
            
            let html = '';
            for(let batch in shipExportTreeData) {
                let count = shipExportTreeData[batch].reduce((sum, item) => sum + item.count, 0);
                let safeBatchId = 'batch_' + Math.random().toString(36).substr(2, 5);
                html += `
                <div class="border rounded mb-2 overflow-hidden border-gray-200">
                    <div class="bg-blue-50 p-2 flex items-center justify-between">
                        <label class="flex items-center gap-2 cursor-pointer flex-1">
                            <input type="checkbox" class="w-4 h-4 text-blue-600 export-batch-cb" value="${batch}">
                            <span class="font-bold text-blue-800">${escapeHtml(batch)} <span class="text-xs font-normal text-blue-600 ml-1">(共${count}件)</span></span>
                        </label>
                        <button onclick="document.getElementById('${safeBatchId}').classList.toggle('hidden')" class="text-xs text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded">展开明细</button>
                    </div>
                    <div id="${safeBatchId}" class="p-2 bg-white space-y-2 hidden">
                `;
                
                shipExportTreeData[batch].forEach(item => {
                    html += `
                        <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer ml-6 border-b border-dashed border-gray-100 pb-1">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 export-item-cb" value="${item.id}" data-batch="${batch}">
                            <span class="flex-1 truncate">${escapeHtml(item.category)} - ${escapeHtml(item.character)}</span>
                            <span class="text-blue-500 font-bold">x${item.count}</span>
                        </label>
                    `;
                });
                
                html += `</div></div>`;
            }
            
            document.getElementById('shipExportTree').innerHTML = html;
            
            document.getElementById('shipExportStep1').classList.remove('hidden');
            document.getElementById('shipExportStep2').classList.add('hidden');
            document.getElementById('shipExportBackBtn').classList.add('hidden');
            document.getElementById('shipExportTextBtn').classList.add('hidden');
            document.getElementById('shipExportImgBtn').classList.add('hidden');
            document.getElementById('shipExportNextBtn').classList.remove('hidden');
            
            document.getElementById('shipExportModal').classList.remove('hidden');
        };

        window.closeShipExportModal = function() {
            document.getElementById('shipExportModal').classList.add('hidden');
        };

        window.shipExportGoStep1 = function() {
            document.getElementById('shipExportStep1').classList.remove('hidden');
            document.getElementById('shipExportStep2').classList.add('hidden');
            document.getElementById('shipExportBackBtn').classList.add('hidden');
            document.getElementById('shipExportTextBtn').classList.add('hidden');
            document.getElementById('shipExportImgBtn').classList.add('hidden');
            document.getElementById('shipExportNextBtn').classList.remove('hidden');
        };

        let exportFinalList = [];
        
        window.shipExportGoStep2 = function() {
            exportFinalList = [];
            let previewHtml = '';
            
            let batchCbs = document.querySelectorAll('.export-batch-cb');
            let itemCbs = document.querySelectorAll('.export-item-cb');
            
            batchCbs.forEach(cb => {
                if(cb.checked) {
                    exportFinalList.push({ type: 'batch', name: cb.value });
                }
            });
            
            itemCbs.forEach(cb => {
                if(cb.checked) {
                    let item = currentShipData.items.find(i => i.id === cb.value);
                    if(item) {
                        exportFinalList.push({ type: 'item', name: `${item.category} - ${item.character}`, count: item.count });
                    }
                }
            });
            
            if(exportFinalList.length === 0) { showToast('请至少勾选一项要导出的内容！', 'warning'); return; }
            
            let sampleItem = currentShipData.items.find(i => window.currentShipSelectedIds.has(i.id));
            let locationName = sampleItem ? (sampleItem.location || '默认仓库') : '默认仓库';
            
            previewHtml += `
                <div class="text-center font-bold text-lg mb-2 text-gray-800 border-b pb-2">排发清单</div>
                <div class="text-sm text-gray-600 mb-4 px-2">
                    <p>cn: <strong class="text-blue-600">${escapeHtml(currentShipRawCn)}</strong></p>
                    <p>囤货地: <strong class="text-green-600">${escapeHtml(locationName)}</strong></p>
                </div>
                <div id="exportDragContainer" class="space-y-1">
            `;
            
            exportFinalList.forEach((line, index) => {
                let lineText = line.type === 'batch' ? escapeHtml(line.name) : `${escapeHtml(line.name)} - ${line.count}`;
                let lineClass = line.type === 'batch' ? 'font-bold text-gray-800 bg-gray-100' : 'text-gray-600 bg-white border border-gray-100';
                
                previewHtml += `
                    <div class="flex items-center gap-2 p-2 rounded cursor-move ${lineClass}" draggable="true" data-index="${index}" ondragstart="exportDragStart(event)" ondragover="exportDragOver(event)" ondrop="exportDrop(event)" ondragend="exportDragEnd(event)">
                        <span class="text-gray-400 cursor-grab px-1 select-none">☰</span>
                        <span class="flex-1 break-words">${lineText}</span>
                    </div>
                `;
            });
            
            previewHtml += `</div>`;
            document.getElementById('shipExportPreview').innerHTML = previewHtml;
            
            bindTouchDragToExportContainer();
            
            document.getElementById('shipExportStep1').classList.add('hidden');
            document.getElementById('shipExportStep2').classList.remove('hidden');
            document.getElementById('shipExportBackBtn').classList.remove('hidden');
            document.getElementById('shipExportTextBtn').classList.remove('hidden');
            document.getElementById('shipExportImgBtn').classList.remove('hidden');
            document.getElementById('shipExportNextBtn').classList.add('hidden');
        };

        // --- 拖拽逻辑 ---
        let exportDraggedElement = null;
        
        window.exportDragStart = function(e) {
            exportDraggedElement = e.currentTarget;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => e.currentTarget.classList.add('opacity-50'), 0);
        };
        
        window.exportDragOver = function(e) {
            e.preventDefault();
            let target = e.currentTarget;
            if(target !== exportDraggedElement) {
                target.classList.add('border-blue-400', 'border-t-2');
            }
        };
        
        window.exportDrop = function(e) {
            e.preventDefault();
            let target = e.currentTarget;
            target.classList.remove('border-blue-400', 'border-t-2');
            if(target !== exportDraggedElement) {
                let container = document.getElementById('exportDragContainer');
                let allItems = Array.from(container.children);
                let draggedIdx = allItems.indexOf(exportDraggedElement);
                let targetIdx = allItems.indexOf(target);
                
                if(draggedIdx < targetIdx) {
                    container.insertBefore(exportDraggedElement, target.nextSibling);
                } else {
                    container.insertBefore(exportDraggedElement, target);
                }
                updateExportFinalListFromDOM();
            }
        };
        
        window.exportDragEnd = function(e) {
            e.currentTarget.classList.remove('opacity-50');
            document.querySelectorAll('#exportDragContainer > div').forEach(el => el.classList.remove('border-blue-400', 'border-t-2'));
        };

        function bindTouchDragToExportContainer() {
            let container = document.getElementById('exportDragContainer');
            let isDragging = false;
            let draggedEl = null;
            let placeholder = null;

            container.addEventListener('touchstart', (e) => {
                let target = e.target.closest('div[draggable="true"]');
                if(!target || !e.target.innerText.includes('☰')) return; 
                
                isDragging = true;
                draggedEl = target;
                
                placeholder = document.createElement('div');
                placeholder.className = draggedEl.className + " opacity-30 border-dashed border-2 border-gray-400";
                placeholder.innerHTML = draggedEl.innerHTML;
                
                draggedEl.classList.add('absolute', 'z-50', 'opacity-90', 'shadow-lg');
                draggedEl.style.width = draggedEl.offsetWidth + 'px';
                
                container.insertBefore(placeholder, draggedEl);
                e.preventDefault();
            }, {passive: false});

            container.addEventListener('touchmove', (e) => {
                if(!isDragging || !draggedEl) return;
                e.preventDefault();
                
                let touch = e.touches[0];
                draggedEl.style.top = (touch.clientY - 20) + 'px';
                
                let elementsUnder = document.elementsFromPoint(touch.clientX, touch.clientY);
                let dropTarget = elementsUnder.find(el => el.hasAttribute('draggable') && el !== draggedEl);
                
                if(dropTarget) {
                    let rect = dropTarget.getBoundingClientRect();
                    let mid = rect.top + rect.height / 2;
                    if(touch.clientY < mid) {
                        container.insertBefore(placeholder, dropTarget);
                    } else {
                        container.insertBefore(placeholder, dropTarget.nextSibling);
                    }
                }
            }, {passive: false});

            container.addEventListener('touchend', (e) => {
                if(!isDragging || !draggedEl) return;
                isDragging = false;
                
                draggedEl.classList.remove('absolute', 'z-50', 'opacity-90', 'shadow-lg');
                draggedEl.style.top = '';
                draggedEl.style.width = '';
                
                container.insertBefore(draggedEl, placeholder);
                placeholder.remove();
                
                updateExportFinalListFromDOM();
            });
        }

        function updateExportFinalListFromDOM() {
            let container = document.getElementById('exportDragContainer');
            let newOrder = [];
            container.querySelectorAll('div[draggable="true"]').forEach(el => {
                let idx = el.getAttribute('data-index');
                newOrder.push(exportFinalList[idx]);
            });
        }

        window.shipExportToText = function() {
            let sampleItem = currentShipData.items.find(i => window.currentShipSelectedIds.has(i.id));
            let locationName = sampleItem ? (sampleItem.location || '默认仓库') : '默认仓库';
            
            let text = `cn: ${currentShipRawCn}\n囤货地: ${locationName}\n`;
            
            document.querySelectorAll('#exportDragContainer > div').forEach(el => {
                let lineText = el.querySelector('.flex-1').innerText;
                text += `${lineText}\n`;
            });
            
            let tempInput = document.createElement('textarea');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            showToast("纯文本已复制到剪贴板！", 'success');
        };

        window.shipExportToImage = function() {
            const element = document.getElementById('shipExportPreview');
            const btn = document.getElementById('shipExportImgBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '生成中...';
            
            element.querySelectorAll('.cursor-grab').forEach(el => el.classList.add('hidden'));

            html2canvas(element, { backgroundColor: '#ffffff', scale: 2 }).then(canvas => {
                const link = document.createElement('a'); 
                link.download = `排发清单_${currentShipRawCn}_${new Date().getTime()}.png`; 
                link.href = canvas.toDataURL('image/png'); 
                link.click();
                
                element.querySelectorAll('.cursor-grab').forEach(el => el.classList.remove('hidden'));
                btn.innerHTML = originalText;
            }).catch(err => { 
                showToast("截图失败", 'error'); 
                element.querySelectorAll('.cursor-grab').forEach(el => el.classList.remove('hidden'));
                btn.innerHTML = originalText; 
            });
        };
        window.updateCurrentLocationDisplay = function() {
            let batch = document.getElementById('shipAdminBatchSelect').value;
            let displaySpan = document.getElementById('currentBatchLocation');
            if(!batch) { 
                displaySpan.innerText = '当前: 无'; 
                displaySpan.className = "text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded border border-gray-300 shadow-sm whitespace-nowrap";
                return; 
            }
            let sampleItem = groupData.find(i => i.batch === batch);
            let loc = sampleItem && sampleItem.location ? sampleItem.location : '未分配';
            
            displaySpan.innerText = `当前囤货地: ${loc}`;
            if(loc === '未分配') {
                displaySpan.className = "text-sm font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded border border-red-200 shadow-sm whitespace-nowrap";
            } else {
                displaySpan.className = "text-sm font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded border border-green-300 shadow-sm whitespace-nowrap";
            }
        };

