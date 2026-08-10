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
                        alert("✅ 图床上传成功！点击下方的【保存】即可生效。");
                    } else {
                        alert("图片上传失败，请重试！");
                    }
                    inputEl.value = ''; 
                }
            }
        }

        const CUSTOM_IMAGE_API = 'https://esaimg.cdn1.vip/api/v1.php'; 

        function dataURLtoFile(dataurl, filename) {
            let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){ u8arr[n] = bstr.charCodeAt(n); }
            return new File([u8arr], filename, {type:mime});
        }

        async function uploadToImageHost(base64Data) {
            const imageFile = dataURLtoFile(base64Data, `img_${Date.now()}.jpg`);
            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                const response = await fetch(CUSTOM_IMAGE_API, { method: 'POST', body: formData });
                const result = await response.json();
                
                let finalUrl = null;
                
                if (result && result.data && result.data.url) {
                    finalUrl = result.data.url; 
                } else if (result && result.url) {
                    finalUrl = result.url;
                }
                
                if (finalUrl) {
                    // 🌟 核心修改：强制把返回的图床域名替换为 esaimg.cdn1.vip
                    finalUrl = finalUrl.replace('img.cdn1.vip', 'esaimg.cdn1.vip');
                    return finalUrl;
                } else {
                    console.error("图床报错:", result);
                    return null;
                }
            } catch (err) {
                console.error("上传图床失败:", err);
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
                        alert("图片上传失败，请重试！");
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
                        alert("图床上传失败，请重试！");
                        inputEl.value = '';
                    }
                }
            }
        }
        
