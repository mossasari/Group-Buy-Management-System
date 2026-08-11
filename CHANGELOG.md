# Changelog

## v1.40 (2026-08-12)

### Added
- **国际运费功能开关** — 云端设置"扩展功能"中可开关国际运费入口，默认开启，与排发表共同受 `applyFeatureToggles` 控制
- **国际排发表** — 运费计算 screen 内 tab 切换，按买家 CN 汇总商品清单、总件数、国际运费、打包费（可编辑并持久化）
- **团次选择导入** — 从团购系统导入商品时弹窗多选团次（替代全部导入），单团次跳过弹窗，同商品数量按 CN 累加
- **图片裁切基础设施** — 集成 Cropper.js CDN + `image-crop.js`（`openImageCrop` 弹窗），尚未接入上传流程

### Changed
- **首页移除计算器入口** — 国际运费按钮从首页移至仪表盘管理 tab 栏（受功能开关控制）
- **仪表盘 tab 顺序调整** — 国际运费 → 云端设置 移至 tab 栏末尾
- **改进计划更新** — P4 方案变更、P6/P12/P13/P15/P16 标记完成、P17-P24 新增

## v1.4.0 (2026-08-11)

### Added
- **国际运费加权计算器** — 作为新 screen 嵌入，按重量比例分摊国际运费
  - 实时计算面板（去皮总重、目标金额、已分配、差额、均价）
  - 可编辑表格（单重和加权费用可手动覆盖，其余自动计算）
  - 从团购系统自动导入商品清单（去重按 category + character）
  - 独立运行能力（Excel/CSV/JSON 导入 + 手动录入）
  - CSV 导出和复制表格
  - localStorage 持久化（`ifc_` 前缀隔离）
  - 代码位于独立仓库 `zhengdaode/intl-freight-calc`

## v1.3.0 (2026-08-11)

### Added
- **P6 黑夜模式** — 全局切换按钮（右上角固定），57 条 CSS 覆盖规则，`prefers-color-scheme` 自动检测
- **P12 功能开关** — 云端可配置的功能开关，默认开启
- **P15 自定义背景** — 支持纯色/图片背景 + 自动遮罩层
- **自定义确认弹窗** — 替换所有原生 `confirm()` 对话框
- **本地调试账户** — `test@test.com` / `test123`，绕过 Supabase 认证，数据存 localStorage

### Fixed
- **XLSX 矩阵导入行偏移** — 修复 `importFileHandler` 中多余的 `Object.keys` 转换导致数据整体下移一行、团期名变为 "0" 的问题
- **P2 云端设置页信息过载** — 6 个配置区块拆分为 3 个分组（基础设置 / 扩展功能 / 仓库与物流）
- **P3 gray-on-color 可读性** — 约 11 处灰色文字在有色背景上的对比度修复
- **P3 主题切换按钮触控目标** — 36×36px → 44×44px，符合 WCAG 最低触控标准
- **CSP 图片托管** — 修复 Content Security Policy 阻止外部图床的问题
- **initCloudData 竞态条件** — 修复数据初始化时的 race condition

### Changed
- 减少界面中不必要的 emoji 使用
- 文件上传控件文字颜色在蓝色背景上改为 `text-blue-600`

---

## v1.2.0 and earlier

See git history for details prior to v1.3.0.
