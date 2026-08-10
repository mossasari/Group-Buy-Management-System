        function updateSidebar() {
            const sidebar = document.getElementById('batchSidebar');
            let batches = [...new Set(groupData.map(i => i.batch))].filter(b => b);
            
            if (currentManageBatch === 'all' || !batches.includes(currentManageBatch)) {
                currentManageBatch = batches.length > 0 ? batches[0] : '';
            }

            sidebar.innerHTML = '';
            batches.forEach(b => {
                let items = groupData.filter(i => i.batch === b);
                let total = items.length;
                let cWei = items.filter(i => (!i.status || i.status === '未到货')).length;
                let cPai = items.filter(i => i.status === '已排发').length;
                
                let tagStr = '';
                let tagClass = '';
                if(total > 0) {
                    if(cPai === total) { tagStr = '全排发'; tagClass = 'bg-purple-100 text-purple-600 border-purple-200'; }
                    else if(cWei === total) { tagStr = '未到货'; tagClass = 'bg-gray-100 text-gray-500 border-gray-200'; }
                    else if(cWei === 0) { tagStr = '已到齐'; tagClass = 'bg-green-100 text-green-600 border-green-200'; }
                    else { tagStr = '部分到货'; tagClass = 'bg-blue-100 text-blue-600 border-blue-200'; }
                }

                let div = document.createElement('div');
                div.className = `cursor-pointer p-2 rounded text-sm flex justify-between items-center gap-2 ${currentManageBatch===b?'bg-blue-50 text-blue-600 font-bold border border-blue-100':'text-gray-600 hover:bg-gray-100 border border-transparent'}`;
                div.innerHTML = `<span class="truncate" title="${escapeHtml(b)}">${escapeHtml(b)}</span> ${tagStr ? `<span class="text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap font-normal ${tagClass}">${tagStr}</span>` : ''}`;
                div.onclick = () => selectManageBatch(b);
                sidebar.appendChild(div);
            });
        }
        
        function selectManageBatch(batch) { currentManageBatch = batch; updateSidebar(); renderManageTable(); }
        window.handleSearch = function() { currentSearchKeyword = document.getElementById('manageSearchInput').value.trim().toLowerCase(); renderManageTable(); };

        function renderManageTable() {
            document.getElementById('manageTitle').innerText = currentManageBatch ? `团期：${currentManageBatch}` : '暂无数据';
            const tbody = document.getElementById('manageTableBody'); tbody.innerHTML = ''; document.getElementById('selectAll').checked = false;
            
            if (!currentManageBatch) return;

            let data = groupData.filter(i => i.batch === currentManageBatch);
            
            if (currentSearchKeyword) data = data.filter(i => i.cn.toLowerCase().includes(currentSearchKeyword) || i.character.toLowerCase().includes(currentSearchKeyword) || i.category.toLowerCase().includes(currentSearchKeyword));
            data.forEach(item => {
                let tr = document.createElement('tr'); 
                tr.className = "hover:bg-blue-50 transition-colors bg-white";
                tr.dataset.id = item.id;
                tr.setAttribute('draggable', 'true');
                tr.ondragstart = (e) => handleDragStart(e, item.id);
                tr.ondragover = handleDragOver;
                tr.ondragleave = handleDragLeave;
                tr.ondrop = (e) => handleDrop(e, item.id);
                tr.ondragend = handleDragEnd;

                tr.innerHTML = `
                    <td class="py-2 px-2 text-center text-gray-400 drag-handle" title="按住拖拽排序">☰</td>
                    <td class="py-2 px-2 text-center"><input type="checkbox" class="row-checkbox" value="${item.id}"></td>
                    <td class="py-2 px-2 max-w-[120px] truncate">${escapeHtml(item.category)}</td>
                    <td class="py-2 px-2 max-w-[150px] truncate">${escapeHtml(item.character)}</td>
                    <td class="py-2 px-2 text-blue-600 font-bold">${escapeHtml(item.cn)}</td>
                    <td class="py-2 px-2 text-gray-500 text-xs">¥${item.price} × ${item.count}</td>
                    <td class="py-2 px-2">${escapeHtml(item.status || '未到货')}</td>
                    <td class="py-2 px-2"><span class="px-2 py-0.5 rounded text-xs border ${item.paidStatus === '已交'?'text-green-600 bg-green-50':'text-red-500 bg-red-50'}">${escapeHtml(item.paidStatus || '未交')}</span></td>
                    <td class="py-2 px-2 flex gap-3"><button class="btn-edit text-blue-500 hover:text-blue-700 font-bold text-xs" data-id="${item.id}">编辑</button><button class="btn-delete text-red-400 hover:text-red-600 font-bold text-xs" data-id="${item.id}">删除</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
        window.toggleSelectAll = function() { document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = document.getElementById('selectAll').checked); };
        function getSelectedIds() { return Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.value); }
        
        window.openBatchEditModal = function() { if(getSelectedIds().length === 0) { showToast('请先勾选数据！', 'warning'); return; } document.getElementById('batchEditModal').classList.remove('hidden'); };
        window.closeBatchEditModal = function() { document.getElementById('batchEditModal').classList.add('hidden'); };
        window.saveBatchEdit = function() {
            const ids = getSelectedIds(), newPaid = document.getElementById('batchEditPaid').value, newStatus = document.getElementById('batchEditStatus').value;
            groupData.forEach(item => { if(ids.includes(item.id)) { if(newPaid) item.paidStatus = newPaid; if(newStatus) item.status = newStatus; } });
            saveData(); closeBatchEditModal(); renderManageTable();
        };

        window.batchDelete = function() {
            const ids = getSelectedIds();
            if(ids.length === 0) { showToast('请先在表格左侧勾选要删除的数据！', 'warning'); return; }
            if(confirm(`确定要删除选中的 ${ids.length} 条数据吗？`)) { groupData = groupData.filter(i => !ids.includes(i.id)); saveData(); updateSidebar(); renderManageTable(); }
        };

        window.openEditModal = function(id) {
            let item = groupData.find(i => i.id === id); if(!item) return;
            document.getElementById('editId').value = item.id; document.getElementById('editCn').value = item.cn; document.getElementById('editBatch').value = item.batch; document.getElementById('editCategory').value = item.category; document.getElementById('editCharacter').value = item.character; document.getElementById('editPrice').value = item.price; document.getElementById('editCount').value = item.count; document.getElementById('editStatus').value = item.status || '未到货'; document.getElementById('editPaid').value = item.paidStatus || '未交';
            document.getElementById('editModal').classList.remove('hidden');
        };
        window.closeEditModal = function() { document.getElementById('editModal').classList.add('hidden'); };
        window.saveEdit = function() {
            let item = groupData.find(i => i.id === document.getElementById('editId').value);
            if(item) {
                item.cn = document.getElementById('editCn').value.trim(); item.batch = document.getElementById('editBatch').value.trim(); item.category = document.getElementById('editCategory').value.trim(); item.character = document.getElementById('editCharacter').value.trim(); item.price = parseFloat(document.getElementById('editPrice').value); item.count = parseInt(document.getElementById('editCount').value); item.status = document.getElementById('editStatus').value; item.paidStatus = document.getElementById('editPaid').value;
                saveData(); closeEditModal(); renderManageTable();
            }
        };
