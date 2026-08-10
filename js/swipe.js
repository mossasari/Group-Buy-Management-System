        window.isSwipeMode = false;
        let isSwipeDragging = false;
        let swipeCheckState = true;

        window.toggleSwipeMode = function() {
            window.isSwipeMode = !window.isSwipeMode;
            let btn = document.getElementById('swipeSelectBtn');
            if(window.isSwipeMode) {
                btn.innerHTML = '🛑 关闭多选';
                btn.classList.replace('bg-gray-100', 'bg-blue-500');
                btn.classList.replace('text-gray-600', 'text-white');
                btn.classList.add('animate-pulse');
            } else {
                btn.innerHTML = '👆 开启多选';
                btn.classList.replace('bg-blue-500', 'bg-gray-100');
                btn.classList.replace('text-white', 'text-gray-600');
                btn.classList.remove('animate-pulse');
            }
        };

        window.toggleSelectLoc = function(loc) {
            let locItems = currentShipData.items.filter(i => (i.location || '默认未分配仓库') === loc);
            if(locItems.length === 0) return;
            
            let allChecked = locItems.every(i => window.currentShipSelectedIds.has(i.id));
            
            if(allChecked) {
                locItems.forEach(i => window.currentShipSelectedIds.delete(i.id));
            } else {
                locItems.forEach(i => window.currentShipSelectedIds.add(i.id));
            }
            
            renderShipItemsPage(window.currentShipPageIndex || 0);
        };

        function getCbFromPoint(x, y) {
            let el = document.elementFromPoint(x, y);
            if(!el) return null;
            return el.closest('label')?.querySelector('.ship-item-cb');
        }

        document.addEventListener('touchstart', (e) => {
            if(!window.isSwipeMode) return;
            let cb = getCbFromPoint(e.touches[0].clientX, e.touches[0].clientY);
            if(cb) {
                isSwipeDragging = true;
                swipeCheckState = !cb.checked;
                cb.checked = swipeCheckState;
                updateShipSelection(cb); 
            }
        }, {passive: false});

        document.addEventListener('touchmove', (e) => {
            if(!window.isSwipeMode || !isSwipeDragging) return;
            e.preventDefault(); 
            let touch = e.touches[0];
            let cb = getCbFromPoint(touch.clientX, touch.clientY);
            if(cb) { cb.checked = swipeCheckState; updateShipSelection(cb); } 

            let y = touch.clientY;
            let h = window.innerHeight;
            if (y > h - 80) window.scrollBy(0, 15);
            else if (y < 80) window.scrollBy(0, -15);
        }, {passive: false});

        document.addEventListener('touchend', () => { isSwipeDragging = false; });

        document.addEventListener('mousedown', (e) => {
            if(!window.isSwipeMode) return;
            let cb = getCbFromPoint(e.clientX, e.clientY);
            if(cb) {
                isSwipeDragging = true;
                swipeCheckState = !cb.checked;
                cb.checked = swipeCheckState;
                updateShipSelection(cb); 
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if(!window.isSwipeMode || !isSwipeDragging) return;
            let cb = getCbFromPoint(e.clientX, e.clientY);
            if(cb) { cb.checked = swipeCheckState; updateShipSelection(cb); } 
            
            let y = e.clientY;
            let h = window.innerHeight;
            if (y > h - 80) window.scrollBy(0, 15);
            else if (y < 80) window.scrollBy(0, -15);
        });

        document.addEventListener('mouseup', () => { isSwipeDragging = false; });
