# 参与贡献 (Contributing)

感谢你对谷圈云端排单管理系统的关注！本项目由 **秋洛 (QiuLuo)** 设计开发。

## 项目结构

```
├── index.html              # 主页面（HTML 骨架）
├── css/styles.css          # 自定义样式
├── js/                     # JavaScript 模块（按功能拆分）
│   ├── core.js             # 基础工具函数
│   ├── data.js             # 数据层 / 云端同步
│   ├── auth.js             # 认证（登录/注册/重置）
│   ├── image-upload.js     # 图片上传
│   ├── order-manage.js     # 订单管理
│   ├── swipe.js            # 滑动多选
│   ├── dashboard.js        # 团长管理端
│   ├── buyer-portal.js     # 团员自助端
│   ├── admin-payment.js    # 交肾审核
│   ├── shipping-export.js  # 排发导出
│   └── admin-shipping.js   # 排发审核 / 云端设置
├── README.md
├── LICENSE                 # CC BY-NC-SA 4.0
└── netlify.toml            # 部署配置
```

## 如何贡献

1. **Fork** 本仓库
2. 创建你的 Feature 分支 (`git checkout -b feature/AmazingFeature`)
3. 修改对应的 JS/CSS/HTML 文件
4. 提交修改 (`git commit -m 'feat: Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 开启一个 **Pull Request**

## 代码风格

- 所有函数挂在 `window` 上（保持全局命名空间兼容性）
- 渲染用户/云端数据时使用 `escapeHtml()` 防 XSS
- 新增功能尽量在对应的 JS 模块中添加，避免修改 index.html

## 安全注意事项

- 永远不要在前端代码中硬编码 Supabase Service Role Key
- 渲染任何用户输入的数据前调用 `escapeHtml()`
- 修改 RLS 策略前先在 Supabase 控制台测试

## 联系作者

发现 Bug 或有新功能想法？可以直接在小红书联系 **特蕾西娅全肯定bot**，或提交 GitHub Issue。
