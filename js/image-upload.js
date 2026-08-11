        window.uploadItemImage = function(inputEl) {
            const file = inputEl.files[0]; if (!file) return;
            showLoading("正在压缩并上传到图床...");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image(); img.src = e.target.result;
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    const MAX_SIZE = 800;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                    const remoteUrl = await uploadToImageHost(compressedBase64);
                    hideLoading();

                    if (remoteUrl) {
                        document.getElementById('imgUrlInput').value = remoteUrl;
                        showToast("图床上传成功！点击下方的【保存】即可生效。", 'success');
                    } else {
                        showToast("图片上传失败，请重试！", 'error');
                    }
                    inputEl.value = '';
                }
            }
        }

        function getImageApiUrl() {
            const config = JSON.parse(imageUrlData['__IMAGE_HOST_CONFIG__'] || '{}');
            return config.api || '';
        }

        function dataURLtoFile(dataurl, filename) {
            let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){ u8arr[n] = bstr.charCodeAt(n); }
            return new File([u8arr], filename, {type:mime});
        }

        async function uploadToImageHost(base64Data) {
            const imageFile = dataURLtoFile(base64Data, `img_${Date.now()}.jpg`);
            const formData = new FormData();
            const config = JSON.parse(imageUrlData['__IMAGE_HOST_CONFIG__'] || '{}');
            const fieldName = config.field || 'image';
            const token = config.token || '';
            formData.append(fieldName, imageFile);

            let apiUrl = getImageApiUrl();
            if (token && config.tokenIn === 'url') {
                apiUrl += (apiUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
            }

            try {
                const headers = {};
                if (token && config.tokenIn === 'header') {
                    headers['Authorization'] = 'Bearer ' + token;
                }

                const response = await fetch(apiUrl, { method: 'POST', body: formData, headers });
                const text = await response.text();
                let result;
                try { result = JSON.parse(text); } catch(e) {
                    console.error("图床返回非JSON:", text.substring(0, 200));
                    showToast('图床返回格式异常，请检查API地址是否正确', 'error');
                    return null;
                }

                let finalUrl = null;

                // 1. 用户自定义响应路径 (如 data.links.url → result.data.links.url)
                if (config.respPath && !finalUrl) {
                    try {
                        finalUrl = config.respPath.split('.').reduce((o, k) => o[k], result);
                    } catch(e) {}
                }

                // 2. Chevereto 格式: { data: { url: "..." } }
                if (!finalUrl && result && result.data && result.data.url) {
                    finalUrl = result.data.url;
                }
                // 3. Lsky Pro 格式: { data: { links: { url: "..." } } }
                if (!finalUrl && result && result.data && result.data.links && result.data.links.url) {
                    finalUrl = result.data.links.url;
                }
                // 4. 顶层 url 字段
                if (!finalUrl && result && result.url) {
                    finalUrl = result.url;
                }
                // 5. 兜底: 遍历找第一个包含 http 的 url 值
                if (!finalUrl) {
                    const findUrl = (obj, depth) => {
                        if (depth > 3) return null;
                        for (let key in obj) {
                            if (typeof obj[key] === 'string' && obj[key].startsWith('http')) return obj[key];
                            if (typeof obj[key] === 'object' && obj[key]) { const r = findUrl(obj[key], depth+1); if (r) return r; }
                        }
                        return null;
                    };
                    finalUrl = findUrl(result, 0);
                }

                if (finalUrl) {
                    return finalUrl;
                } else {
                    console.error("图床返回:", result);
                    const errMsg = result && result.message ? result.message : '响应中未找到图片URL';
                    showToast('图床上传失败: ' + errMsg, 'error');
                    return null;
                }
            } catch (err) {
                console.error("上传图床失败:", err);
                const msg = err.message || '';
                if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                    showToast('无法连接图床，请检查网络或API地址', 'error');
                } else {
                    showToast('上传失败: ' + msg, 'error');
                }
                return null;
            }
        }
        window.currentBuyerUploadBase64 = '';

        window.handleBuyerUpload = function(inputEl, previewId) {
            const file = inputEl.files[0]; if (!file) return;
            showLoading("正在压缩并上传到图床...");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image(); img.src = e.target.result;
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    const MAX_SIZE = 800;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

                    const remoteUrl = await uploadToImageHost(compressedBase64);
                    hideLoading();

                    if (remoteUrl) {
                        window.currentBuyerUploadBase64 = remoteUrl;
                        document.getElementById(previewId).classList.remove('hidden');
                        document.getElementById(previewId).querySelector('img').src = remoteUrl;
                    } else {
                        showToast("图片上传失败，请重试！", 'error');
                        inputEl.value = '';
                    }
                }
            }
        }

        window.uploadProofImage = function(reqId, inputEl) {
            const file = inputEl.files[0]; if (!file) return;
            showLoading("压缩上传到图床中...");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image(); img.src = e.target.result;
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height;
                    const MAX_SIZE = 800; 
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

                    const remoteUrl = await uploadToImageHost(compressedBase64);

                    if (remoteUrl) {
                        updateShipAdminReq(reqId, 'proofImg', remoteUrl);
                    } else {
                        hideLoading();
                        showToast("图床上传失败，请重试！", 'error');
                        inputEl.value = '';
                    }
                }
            }
        }
        
