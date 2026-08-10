        let shipExportTreeData = {};
        
        window.openShipExportModal = function() {
            if(window.currentShipSelectedIds.size === 0) return alert('请先勾选需要导出的谷子哦！');
            
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
                            <span class="font-bold text-blue-800">${batch} <span class="text-xs font-normal text-blue-600 ml-1">(共${count}件)</span></span>
                        </label>
                        <button onclick="document.getElementById('${safeBatchId}').classList.toggle('hidden')" class="text-xs text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded">展开明细</button>
                    </div>
                    <div id="${safeBatchId}" class="p-2 bg-white space-y-2 hidden">
                `;
                
                shipExportTreeData[batch].forEach(item => {
                    html += `
                        <label class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer ml-6 border-b border-dashed border-gray-100 pb-1">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 export-item-cb" value="${item.id}" data-batch="${batch}">
                            <span class="flex-1 truncate">${item.category} - ${item.character}</span>
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
            
            if(exportFinalList.length === 0) return alert('请至少勾选一项要导出的内容！');
            
            let sampleItem = currentShipData.items.find(i => window.currentShipSelectedIds.has(i.id));
            let locationName = sampleItem ? (sampleItem.location || '默认仓库') : '默认仓库';
            
            previewHtml += `
                <div class="text-center font-bold text-lg mb-2 text-gray-800 border-b pb-2">排发清单</div>
                <div class="text-sm text-gray-600 mb-4 px-2">
                    <p>cn: <strong class="text-blue-600">${currentShipRawCn}</strong></p>
                    <p>囤货地: <strong class="text-green-600">${locationName}</strong></p>
                </div>
                <div id="exportDragContainer" class="space-y-1">
            `;
            
            exportFinalList.forEach((line, index) => {
                let lineText = line.type === 'batch' ? line.name : `${line.name} - ${line.count}`;
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
            
            alert('✅ 纯文本已复制到剪贴板！');
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
                alert('截图失败'); 
                element.querySelectorAll('.cursor-grab').forEach(el => el.classList.remove('hidden'));
                btn.innerHTML = originalText; 
            });
        };
            if (!currentShipData.items || currentShipData.items.length === 0) {
                return alert('当前没有可排发的数据！');
            }
            
            let treeContainer = document.getElementById('shipExportTree');
            treeContainer.innerHTML = '';
            
            // 数据按照 实际CN -> 囤货地 -> 团期 分组
            let exportData = {};
            currentShipData.items.forEach(item => {
                let actualCn = item.cn || '未知';
                let loc = item.location || '默认未分配仓库';
                let batch = item.batch || '未知团期';

                if (!exportData[actualCn]) exportData[actualCn] = {};
                if (!exportData[actualCn][loc]) exportData[actualCn][loc] = {};
                if (!exportData[actualCn][loc][batch]) exportData[actualCn][loc][batch] = [];

                exportData[actualCn][loc][batch].push(item);
            });

            // 渲染勾选结构
            let html = '';
            let globalBatchIdx = 0;
            for (let cn in exportData) {
                html += `<div class="mb-4 border border-blue-200 rounded p-3 bg-white shadow-sm">
                            <div class="font-bold text-lg text-blue-800 border-b border-blue-100 pb-1 mb-2">cn: ${cn}</div>`;
                for (let loc in exportData[cn]) {
                    html += `<div class="ml-2 mb-3">
                                <div class="font-bold text-gray-700 text-sm mb-2 bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">囤货地: ${loc}</div>`;
                    for (let batch in exportData[cn][loc]) {
                        globalBatchIdx++;
                        let items = exportData[cn][loc][batch];
                        html += `
                        <div class="ml-3 mt-1 border-l-2 border-gray-200 pl-3 pb-2">
                            <div class="flex items-center gap-2 mb-1">
                                <input type="checkbox" class="export-batch-cb w-4 h-4 cursor-pointer" data-cn="${cn}" data-loc="${loc}" value="${batch}">
                                <span class="font-bold text-gray-800 cursor-pointer select-none hover:text-blue-600 transition" onclick="document.getElementById('export_batch_items_${globalBatchIdx}').classList.toggle('hidden')">${batch} <span class="text-xs text-blue-500 font-normal ml-2 bg-blue-50 px-1 rounded border border-blue-100">展开明细</span></span>
                            </div>
                            <div id="export_batch_items_${globalBatchIdx}" class="hidden ml-5 space-y-1.5 mt-2 bg-gray-50 p-2 rounded border border-gray-100">`;
                        items.forEach(item => {
                            let itemStr = `${item.batch}-${item.category}-${item.character}-${item.count}`;
                            html += `
                                <label class="flex items-start gap-2 text-gray-600 text-xs cursor-pointer hover:bg-white p-1 rounded transition">
                                    <input type="checkbox" class="export-item-cb w-3.5 h-3.5 mt-0.5" data-cn="${cn}" data-loc="${loc}" data-batch="${batch}" value="${itemStr}">
                                    <span class="leading-tight">${itemStr}</span>
                                </label>`;
                        });
                        html += `</div></div>`;
                    }
                    html += `</div>`;
                }
                html += `</div>`;
            }
            treeContainer.innerHTML = html;
            
            shipExportGoStep1();
            document.getElementById('shipExportModal').classList.remove('hidden');
        };

        window.closeShipExportModal = function() {
            document.getElementById('shipExportModal').classList.add('hidden');
        };

        window.shipExportGoStep1 = function() {
            document.getElementById('shipExportStep1').classList.remove('hidden');
            document.getElementById('shipExportStep2').classList.add('hidden');
            document.getElementById('shipExportNextBtn').classList.remove('hidden');
            document.getElementById('shipExportBackBtn').classList.add('hidden');
            document.getElementById('shipExportTextBtn').classList.add('hidden');
            document.getElementById('shipExportImgBtn').classList.add('hidden');
        };

        window.shipExportGoStep2 = function() {
            let previewContainer = document.getElementById('shipExportPreview');
            previewContainer.innerHTML = '';
            
            let batchCbs = document.querySelectorAll('.export-batch-cb:checked');
            let itemCbs = document.querySelectorAll('.export-item-cb:checked');
            
            if(batchCbs.length === 0 && itemCbs.length === 0) {
                return alert('请至少在列表中勾选一项你要导出的内容！');
            }

            let previewData = {};
            
            batchCbs.forEach(cb => {
                let cn = cb.getAttribute('data-cn');
                let loc = cb.getAttribute('data-loc');
                let batch = cb.value;
                if(!previewData[cn]) previewData[cn] = {};
                if(!previewData[cn][loc]) previewData[cn][loc] = [];
                previewData[cn][loc].push({ type: 'batch', text: batch });
            });

            itemCbs.forEach(cb => {
                let cn = cb.getAttribute('data-cn');
                let loc = cb.getAttribute('data-loc');
                let itemStr = cb.value;
                if(!previewData[cn]) previewData[cn] = {};
                if(!previewData[cn][loc]) previewData[cn][loc] = [];
                previewData[cn][loc].push({ type: 'item', text: itemStr });
            });

            let html = '';
            for(let cn in previewData) {
                html += `<div class="export-preview-cn-block mb-6" data-cn="${cn}">
                            <div class="font-bold text-[15px] border-b border-gray-300 mb-2 pb-1 text-black">cn:${cn}</div>`;
                for(let loc in previewData[cn]) {
                    html += `<div class="export-preview-loc-block ml-1 mb-4" data-loc="${loc}">
                                <div class="text-[13px] font-bold text-gray-800 mb-2">囤货地:${loc}</div>
                                <ul class="export-sortable-list space-y-1.5 ml-1 border-l-[3px] border-gray-200 pl-2 min-h-[30px]">`;
                    previewData[cn][loc].forEach(row => {
                        html += `<li class="p-2 bg-gray-50 border border-gray-200 rounded text-[13px] text-black cursor-move flex items-start gap-2 hover:bg-gray-100 shadow-sm transition-colors" draggable="true" ondragstart="exportDragStart(event)" ondragover="exportDragOver(event)" ondrop="exportDrop(event)" ondragend="exportDragEnd(event)">
                                    <span class="text-gray-400 mt-0.5 select-none drag-handle">☰</span> <span class="export-row-text break-all">${row.text}</span>
                                 </li>`;
                    });
                    html += `</ul></div>`;
                }
                html += `</div>`;
            }

            previewContainer.innerHTML = html;

            document.getElementById('shipExportStep1').classList.add('hidden');
            document.getElementById('shipExportStep2').classList.remove('hidden');
            document.getElementById('shipExportNextBtn').classList.add('hidden');
            document.getElementById('shipExportBackBtn').classList.remove('hidden');
            document.getElementById('shipExportTextBtn').classList.remove('hidden');
            document.getElementById('shipExportImgBtn').classList.remove('hidden');
        };

        // 导出弹窗内的拖拽排序逻辑
        let exportDragSrcEl = null;
        window.exportDragStart = function(e) {
            exportDragSrcEl = e.currentTarget;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.currentTarget.innerHTML);
            setTimeout(() => { e.currentTarget.classList.add('opacity-50', 'bg-blue-50'); }, 0);
        };
        window.exportDragOver = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            let targetLi = e.target.closest('li');
            if(targetLi && targetLi !== exportDragSrcEl) {
                targetLi.classList.add('border-blue-400');
            }
            return false;
        };
        window.exportDrop = function(e) {
            e.stopPropagation();
            let targetLi = e.target.closest('li');
            if (exportDragSrcEl !== targetLi && targetLi) {
                let list = targetLi.parentNode;
                let siblings = Array.from(list.children);
                let srcIdx = siblings.indexOf(exportDragSrcEl);
                let targetIdx = siblings.indexOf(targetLi);
                if(srcIdx < targetIdx) {
                    list.insertBefore(exportDragSrcEl, targetLi.nextSibling);
                } else {
                    list.insertBefore(exportDragSrcEl, targetLi);
                }
            }
            return false;
        };
        window.exportDragEnd = function(e) {
            e.currentTarget.classList.remove('opacity-50', 'bg-blue-50');
            document.querySelectorAll('.export-sortable-list li').forEach(li => {
                li.classList.remove('border-blue-400');
            });
        };

        window.getExportTextString = function() {
            let container = document.getElementById('shipExportPreview');
            let text = '';
            let cnBlocks = container.querySelectorAll('.export-preview-cn-block');
            cnBlocks.forEach(cnBlock => {
                text += `cn:${cnBlock.getAttribute('data-cn')}\n`;
                let locBlocks = cnBlock.querySelectorAll('.export-preview-loc-block');
                locBlocks.forEach(locBlock => {
                    text += `囤货地:${locBlock.getAttribute('data-loc')}\n`;
                    let items = locBlock.querySelectorAll('.export-row-text');
                    items.forEach(item => {
                        text += `${item.innerText.trim()}\n`;
                    });
                    text += `\n`; 
                });
            });
            return text.trim();
        }

        window.shipExportToText = function() {
            let text = window.getExportTextString();
            if(!text) return alert("无可导出的内容");
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('✅ 纯文字清单已成功复制到剪贴板！');
                }).catch(err => {
                    fallbackCopyTextToClipboard(text);
                });
            } else {
                fallbackCopyTextToClipboard(text);
            }
        };

        function fallbackCopyTextToClipboard(text) {
            let textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert('✅ 纯文字清单已成功复制到剪贴板！');
            } catch (err) {
                alert('⚠️ 复制失败，请手动长按文字复制。');
            }
            document.body.removeChild(textArea);
        }

        window.shipExportToImage = function() {
            let btn = document.getElementById('shipExportImgBtn');
            let originalText = btn.innerText;
            btn.innerText = '生成中...';
            
            let container = document.getElementById('shipExportPreview');
            // 截图前隐藏掉拖拽图标，让图片更干净
            let handles = container.querySelectorAll('.drag-handle');
            handles.forEach(h => h.style.display = 'none');
            
            html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            }).then(canvas => {
                handles.forEach(h => h.style.display = ''); 
                btn.innerText = originalText;
                const link = document.createElement('a');
                link.download = `排发清单_${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                handles.forEach(h => h.style.display = '');
                btn.innerText = originalText;
                alert('截图生成失败');
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

