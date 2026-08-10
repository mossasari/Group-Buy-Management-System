# 谷圈云端排单管理系统 — 改进方向分析

> **日期**: 2026-08-10
> **版本**: v1.1.0 (模块化重构 + XSS 修复)
> **状态**: 分析文档，未实施

---

## 1. 图床可配置化 + 自动迁移（可行性分析）

### 当前逻辑

图床 API 硬编码在 `js/image-upload.js:33`：

```js
const CUSTOM_IMAGE_API = 'https://esaimg.cdn1.vip/api/v1.php';
```

所有上传函数都通过 `uploadToImageHost()` → `CUSTOM_IMAGE_API` 这一条路径。

### 可配置化方案

在团长管理端 → 云端设置 Tab 中添加图床配置项：

```
图床 API 地址: [________________] (默认: esaimg.cdn1.vip)
```

存入 `imageUrlData['__IMAGE_HOST_CONFIG__']`，`uploadToImageHost()` 读取该配置。上传逻辑集中在一个函数，改一处即可全局生效。

**可行性：✅ 高**

### 自动迁移旧图片的可行性

"修改图床时自动同步到新图床"完整流程：

```
旧图床URL → fetch下载 → base64 → 新图床API上传 → 新URL → 替换所有引用
```

**需要替换 URL 的位置：**

| 存储位置 | 字段 |
|---------|------|
| `imageUrlData[key]` | 柄图 URL |
| `imageUrlData['__PAYMENT_REQS__']` | 交肾截图 proofImg |
| `imageUrlData['__SHIPPING_REQS__']` | 排发凭证 proofImg + buyerProofImg |
| `imageUrlData['__PAYMENT_SETTINGS__']` | 收款码 URL |
| `imageUrlData['__LOCATION_SETTINGS__']` | 仓库收款码 url |

**风险：**

| 风险 | 级别 | 说明 |
|------|------|------|
| 旧图床不可用 | 🔴 | 源站关闭则无法下载，图片永久丢失 |
| 跨域限制 | 🟡 | 旧图床可能禁止 CORS，fetch 被拦截 |
| 迁移耗时 | 🟡 | 100 张图片串行上传可能需数分钟 |
| 部分失败回滚 | 🟡 | 新旧 URL 混杂难以恢复 |

**推荐策略：不自动全量迁移。** 改为：新上传走新图床 + 旧图片保持原 URL + 提供单张"迁移此图片"按钮（可撤销）。

---

## 2. 邮箱验证跳转 localhost Bug

### 根因

`js/auth.js` 中 `signUp()` 和 `resetPasswordForEmail()` 未传 `redirectTo` 参数，Supabase 回退到项目默认 Site URL（通常为 `http://localhost:3000`）。

### 修复（2 行代码 + 1 处 Supabase 配置）

```js
// auth.js — signUp
db.auth.signUp({ email, password: pwd,
    options: { emailRedirectTo: window.location.origin }
});

// auth.js — resetPasswordForEmail
db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
});
```

Supabase Dashboard → Authentication → URL Configuration → Site URL 设为实际域名。

**工作量：极小。优先级：🔴 P0（阻断新用户注册）**

---

## 3. 数据操作反馈与自动刷新

### 当前问题

- CRUD 操作后无 UI 刷新，需手动切 Tab
- 全部用 `alert()` 提示，体验差
- 团员端提交后虽有手动刷新调用，但无视觉反馈

### 改进方案

**A. Toast 通知系统（替代 alert）**

```js
function showToast(msg, type) { /* 右上角弹出，3秒自动消失 */ }
```

替换所有 `alert()` 调用。成功=绿色，失败=红色，警告=黄色。

**B. 操作后自动刷新**

| 操作 | 当前 | 改进后 |
|------|------|--------|
| 录入商品 | 无反馈 | showToast + renderManageTable + updateSidebar |
| 批量编辑/删除 | alert | showToast + 自动刷新 |
| 交肾/排发提交 | alert | showToast + 刷新列表 |
| 审核通过/驳回 | 静默 | showToast + 刷新列表 |

**工作量：中（~30 处 showToast + ~15 处自动刷新）。优先级：🟡 P1**

---

## 4. 关于页面

新增 `#page-about` 屏幕，展示：项目名称、版本号（`APP_VERSION` 常量）、原作者署名（秋洛）、许可证（CC BY-NC-SA 4.0）、技术栈、项目链接。

**工作量：小（~30 行 HTML）。优先级：🟢 P3**

---

## 5. 黑夜模式

### 实现方案

利用 Tailwind CDN 的 `dark:` 前缀。在 `<html>` 上切换 `class="dark"`，所有组件添加 `dark:bg-xxx dark:text-xxx` 变体。初始化脚本放在 `<head>` 防闪烁。切换按钮放在导航栏。

### 二次元暗色方向

- **夜空紫** `#1a1025` — 魔法少女风
- **深夜蓝** `#0f172a` — 轻小说封面风
- **墨黑金** `#171717` — 哥特风

**工作量：大（需覆盖所有组件）。优先级：🟢 P4**

---

## 6. 二次元风格方向

| 风格 | 配色 | 参考 | 适合度 |
|------|------|------|--------|
| 樱花粉 | `#fce4ec` 粉底 + `#e91e63` 点缀 | 少女漫画 | ⭐⭐⭐⭐⭐ |
| 和风 | `#f5f0e8` 米底 + `#8b4513` 棕 + `#c41e3a` 朱红 | 京都、千与千寻 | ⭐⭐⭐⭐ |
| 梦幻星空 | `#1a0533` 紫黑 + 渐变紫蓝 | 魔法少女小圆 | ⭐⭐⭐⭐ |
| 学院风 | `#faf8f5` 暖白 + `#2c5282` 蓝 | 轻小说封面 | ⭐⭐⭐ |

**推荐：樱花粉 + 和风元素混合** — 温暖、轻量、适配谷圈受众。

可通过 `impeccable` 设计 skill 进行：色彩系统提取、圆角阴影层次、字体对比、卡片节奏、hover/active 状态、装饰元素统一。

---

## 7. 优先级总览

| # | 方向 | 复杂度 | 影响面 | 优先级 |
|---|------|--------|--------|--------|
| 2 | 邮箱跳转修复 | 极小 | 🔴 阻断注册 | **P0** |
| 3 | 操作反馈+自动刷新 | 中 | 🟡 全平台UX | **P1** |
| 1a | 图床可配置化 | 中 | 🟡 灵活部署 | **P2** |
| 4 | 关于页面 | 小 | 🟢 合规 | **P3** |
| 6 | 设计优化+二次元风格 | 大 | 🟢 视觉焕新 | **P4** |
| 5 | 黑夜模式 | 大 | 🟢 视觉体验 | **P5** |
| 1b | 旧图自动迁移 | 大 | 🔴 数据安全 | **暂缓** |
