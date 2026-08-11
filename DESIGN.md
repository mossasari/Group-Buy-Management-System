---
name: 谷圈云端排单管理系统
description: 为动漫周边拼团提供从排单到排发的完整管理工具
colors:
  primary: "#3b82f6"
  primary-hover: "#2563eb"
  primary-light: "#eff6ff"
  payment: "#eab308"
  payment-hover: "#ca8a04"
  payment-light: "#fefce8"
  shipping: "#22c55e"
  shipping-hover: "#16a34a"
  shipping-light: "#f0fdf4"
  rank: "#ec4899"
  rank-hover: "#db2777"
  rank-light: "#fdf2f8"
  cloud: "#a855f7"
  cloud-hover: "#9333ea"
  cloud-light: "#faf5ff"
  export: "#6366f1"
  export-hover: "#4f46e5"
  export-light: "#eef2ff"
  feature: "#f59e0b"
  feature-hover: "#d97706"
  feature-light: "#fffbeb"
  danger: "#ef4444"
  danger-hover: "#dc2626"
  neutral-50: "#f9fafb"
  neutral-100: "#f3f4f6"
  neutral-200: "#e5e7eb"
  neutral-300: "#d1d5db"
  neutral-400: "#9ca3af"
  neutral-500: "#6b7280"
  neutral-600: "#4b5563"
  neutral-700: "#374151"
  neutral-800: "#1f2937"
  neutral-900: "#111827"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 2.25
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 2
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.75
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-domain:
    rounded: "{rounded.md}"
    padding: "16px 24px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.neutral-700}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: 谷圈云端排单管理系统

## Overview

**Creative North Star: "谷圈账本 (Guzi Ledger)"**

谷圈账本是一个为团长设计的数字工具，视觉语言来自手写拼团账本的质感——白色卡片像贴在浅灰底纸上的票据，彩色功能标签像不同颜色的便签纸，emoji 是手绘的记号。系统不是冰冷的后台管理面板，而是社团活动室里那本被翻得最勤的账本的数字版。

整体密度中等偏高：团员端（手机）一个屏幕完成一个任务，团长端（电脑）在密集表格中通过色彩分区快速定位。氛围亲切但不幼稚——用语是谷圈黑话（猪猪、吃谷、交肾），但 UI 不依赖花哨装饰，靠清晰的功能色彩分区和充足的留白来维持专业感。反参考是企业后台管理系统那种灰色一片、全是表格数字的冰冷感；也拒绝花哨的二次元主题站（满屏粉色、角色装饰、花体字）。

**Key Characteristics:**
- 功能色域导航：每种操作类型有专属颜色（蓝=管理、黄=交肾、绿=排发、粉=成就、紫=设置、靛=导出、琥珀=实验）
- 账本页面层次：白色卡片 + 浅灰背景 + 细边框，像纸张叠放，不用浮动阴影
- 实用工具手感：按钮够大够好点，输入框够清晰够好扫，表格够紧凑够好对
- 黑夜模式已内置，暗色背景 + 柔和文字，减少暗光环境视觉疲劳
- emoji 作为视觉锚点：功能入口用 emoji 做图标，降低纯文字的认知负担

## Colors

调色板直接使用 Tailwind CSS 默认色阶，不做重命名。每个功能域有自己的颜色，形成「看一眼颜色就知道在哪」的空间导航。

### Primary
- **blue-500** (#3b82f6): 默认操作色。登录按钮、保存按钮、主 CTA、链接、焦点环。代表「团长管理」功能域。
- **blue-600** (#2563eb): hover 态。按钮悬停时的加深色。
- **blue-50** (#eff6ff): 浅底色。信息提示区、上传区底色、团员查询结果摘要。

### Functional Accents
- **yellow-500** (#eab308): 交肾/付款功能域。交肾入口按钮、提交审核按钮、交肾工作台标题。
- **green-500** (#22c55e): 排发/物流功能域。排发入口按钮、确认提交按钮、排发工作台标题。
- **pink-500** (#ec4899): 猪猪成就/排名功能域。猪猪入口按钮、CN 输入框边框、成就报告区。
- **purple-500** (#a855f7): 云端设置功能域。设置页标题、保存密钥按钮、全局设置卡片。
- **indigo-500** (#6366f1): 图床/导出功能域。导出图片按钮、图床配置卡片。
- **amber-500** (#f59e0b): 实验功能/开关功能域。功能开关卡片、保存开关按钮。

### Destructive
- **red-500** (#ef4444): 删除/重置/退出。批量删除按钮、重置密码按钮、退出登录链接。只用在这些需要谨慎操作的场景。

### Neutral
- **gray-50** (#f9fafb): 卡片内浅底色、表头背景、加载状态背景。
- **gray-100** (#f3f4f6): 全局页面背景（浅色模式）、次要按钮背景。
- **gray-200** (#e5e7eb): 卡片边框、分割线。
- **gray-300** (#d1d5db): 输入框默认边框。
- **gray-400** (#9ca3af): 占位文字、辅助说明文字。
- **gray-500** (#6b7280): 次要文字、导航未激活态。
- **gray-700** (#374151): 正文文字（浅色模式）。
- **gray-800** (#1f2937): 标题文字。
- **gray-900** (#111827): 最高强调文字（极少使用）。

### Named Rules
**The One-Domain-One-Color Rule.** 每个功能域独占一种颜色，不跨域混用。蓝色按钮只在管理/登录场景出现；黄色只用于交肾相关；绿色只用于排发相关。这种「颜色 = 位置」的映射让用户在密集信息中不需要读文字就能判断所在区域。

**The Gray Canvas Rule.** 全局底色始终是 gray-100（浅色模式）或 gray-900（暗色模式）。白色卡片浮在灰色画布上，形成唯一的深度层次。不在卡片上叠加卡片。

## Typography

**Display Font:** Tailwind `font-sans` 系统字体栈 (ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)
**Body Font:** 同上。中文环境下实际渲染为苹方（macOS/iOS）、微软雅黑（Windows）、Noto Sans（Android）。
**Label/Mono Font:** 无独立等宽字体；代码/数据场景使用系统默认。

**Character:** 不引入 web font，零额外加载。依赖操作系统原生中文字体渲染，确保在 QQ 内置浏览器（安卓 WebView）中稳定显示。字体策略是「让系统做它最擅长的事」。

### Hierarchy
- **Display** (extrabold 800, 1.875rem / text-3xl, line-height 2.25): 首页标题「排单系统」、大屏主视觉。只在入口页使用。
- **Headline** (bold 700, 1.5rem / text-2xl, line-height 2): 页面主标题。登录页、各功能卡片标题。
- **Title** (bold 700, 1.125rem / text-lg, line-height 1.75): 卡片内部标题、弹窗标题、表格分组标题。
- **Body** (normal 400, 1rem / text-base, line-height 1.5): 正文。移动端降为 14px（text-sm）。
- **Label** (semibold 600, 0.875rem / text-sm, line-height 1.25): 表单标签、按钮文字、表格列头。加粗用于区分可交互元素。

### Named Rules
**The System Font Rule.** 不引入任何 web font。系统字体在中文环境下渲染质量最高，且零加载时间。QQ 内置浏览器的 web font 支持不稳定，这个选择是有意为之。

## Layout

基于 Tailwind CSS 默认 4px 栅格。无自定义间距值。

**容器策略：**
- 首页/认证页：`max-w-md` (28rem / 448px)，居中单列
- 团员功能页：`max-w-2xl` (42rem / 672px)，居中单列
- 团长 Dashboard：`max-w-7xl` (80rem / 1280px)，自适应多列

**响应式行为：**
- 移动端（<768px）：所有页面单列堆叠，字体缩小至 14px，padding 从 p-6 降至 p-4
- 桌面端（≥768px）：Dashboard 多列网格布局（订单管理页左侧团期栏 256px + 右侧表格自适应）
- Dashboard 顶部 tab 栏：移动端横向滚动（`overflow-x-auto`），桌面端居中换行

**间距节奏：**
- 卡片内部：p-4 (16px) 移动端，p-6 (24px) 桌面端
- 卡片之间：space-y-4 或 gap-4 (16px)
- 表单字段间：space-y-3 或 space-y-4 (12-16px)
- 页面级段落：mb-6 (24px)

## Elevation & Depth

**账本页面感 (Ledger Page Stacking).** 系统不使用浮动阴影来暗示 z 轴深度。唯一的层次是：白色卡片（bg-white + border + shadow-sm）浮在浅灰背景（bg-gray-100）上。这模拟了纸质账本上贴票据的视觉效果——阴影只够暗示「这是另一张纸」，不足以让卡片漂浮。

hover 态通过边框颜色变化（border-gray-200 → border-{domain}-300）或背景加深来传达，不加阴影。

### Shadow Vocabulary
- **card** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): 唯一使用的阴影。所有白色卡片共享此值。对应 Tailwind `shadow-sm`。
- **none**: 按钮、输入框、tab、弹窗均无阴影。弹窗靠 `bg-black bg-opacity-50` 遮罩区分层次。

### Named Rules
**The Paper-Edge Rule.** 深度只用边框传达，不用阴影。卡片的 `border border-gray-200` 是「纸的边缘」。如果需要强调，加深边框颜色而不是加阴影。这个约束让系统在 QQ 内置浏览器的低端 GPU 上也能流畅渲染。

## Shapes

**圆角策略：** 默认圆角体系来自 Tailwind 默认 scale。

- **卡片和按钮**: 8px 圆角 (`rounded-lg`)。够圆以区分于表格和输入框，够方以不显得像药丸。
- **输入框和选择框**: 4px 圆角 (`rounded`)。最小的视觉柔化，保持表单的精确感。
- **圆形元素**: 9999px (`rounded-full`)。黑夜模式切换按钮（固定 44×44px 圆，满足 WCAG 触控目标）、搜索框（圆角全 pill）。
- **弹窗**: 8px 圆角 (`rounded-lg`)，继承卡片语言。

**边框语言：**
- 功能域卡片使用对应颜色的浅色边框（`border-{domain}-200`）
- 表格使用 `border-gray-200` 分隔
- 输入框默认 `border-gray-300`，聚焦时切换为对应功能域颜色（`focus:border-{domain}-500`）

## Components

### Buttons
- **Shape:** 8px 圆角 (`rounded-lg`)，内边距按尺寸分 py-2 (8px) / py-3 (12px) / py-4 (16px)。
- **Primary (蓝底):** `bg-blue-500 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-600 transition`。用于登录、保存、确认等主要操作。
- **Domain (功能色底):** 与 Primary 同结构，背景色替换为对应功能色（yellow-500 交肾、green-500 排发、pink-500 猪猪、purple-500 云端、indigo-500 导出、amber-500 功能开关）。hover 时加深一档。
- **Secondary (白底边框):** `bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition`。门户首页的功能入口按钮。每个功能域有对应颜色变体（border-yellow-200 text-yellow-700 等）。
- **Ghost (文字链接):** `text-gray-400 hover:text-gray-600` 或 `text-red-500 hover:underline`。用于导航、退出等低优先级操作。
- **Focus:** `focus:outline-none` + 边框颜色切换。无 focus ring，依赖边框色变化传达焦点。

### Cards
- **Corner Style:** 8px 圆角 (`rounded-lg`)。
- **Background:** `bg-white`（浅色模式）/ `bg-gray-800` 等效色（暗色模式通过 CSS 覆盖）。
- **Shadow Strategy:** `shadow-sm`，见 Elevation 章节。
- **Border:** `border border-gray-200` 默认；功能域卡片使用 `border-{domain}-200`（如 `border-yellow-200`）。
- **Internal Padding:** p-4 (移动端) / p-6 (桌面端)。

### Inputs / Fields
- **Style:** `border border-gray-300 rounded px-3 py-2 text-sm bg-white`。
- **Focus:** `focus:border-{domain}-500 focus:outline-none`。边框从 gray-300 切换为对应功能域颜色，不添加 ring/shadow。
- **Placeholder:** 使用 Tailwind 默认 placeholder 颜色（gray-400）。
- **Dark mode:** 背景切换为 #334155，文字 #e2e8f0，边框 #475569。

### Navigation
- **Dashboard Tabs:** 横向 tab 栏，激活态 `border-bottom: 2px solid #3b82f6` + `text-blue-600 font-semibold`，未激活态 `text-gray-500 hover:text-blue-500`。移动端横向滚动，桌面端居中换行。
- **Back links:** `text-gray-400 hover:text-gray-600`，置于页面左上角，统一 "← 返回首页" 文案。
- **Page title bar:** Dashboard 顶部固定蓝色标题「排单云后台」+ 右侧同步状态指示器 + 退出登录。

### Modals
- **Backdrop:** `bg-black bg-opacity-50 fixed inset-0 z-50`。
- **Container:** `bg-white rounded-lg p-5 max-w-md shadow-xl max-h-[90vh] overflow-y-auto`。
- **Header:** `text-lg font-bold mb-4 text-gray-800`。
- **Footer:** `mt-6 flex justify-end gap-3`，取消按钮（白底边框）+ 确认按钮（功能色底）。

### Toast
- **Position:** `fixed top-4 right-4 z-[9999]`。
- **Style:** 功能色底（green-500 成功 / red-500 错误 / yellow-500 警告 / blue-500 信息），`text-white px-4 py-3 rounded-lg shadow-lg`。
- **Animation:** `fadeIn 0.3s ease-in-out`（从下方滑入 + 淡入），3 秒后淡出移除。
- **Icon:** emoji 前缀（✅/❌/⚠️/ℹ️）。

## Do's and Don'ts

### Do:
- **Do** 给每个功能区域用其专属颜色：管理用蓝、交肾用黄、排发用绿、成就用粉、设置用紫、导出用靛、实验用琥珀。颜色即导航。
- **Do** 保持卡片「账本页面」层次：白色卡片浮在 gray-100 背景上，只用 `shadow-sm`，不叠加更重的阴影。
- **Do** 在功能入口和状态提示中使用 emoji 作为视觉锚点（🔍💰📦🐷👑☁️✅❌⚠️ℹ️）。
- **Do** 按钮文案用动词开头（「立即查询」「确认提交」「保存密钥」），让每个按钮的目的不需要上下文就能理解。
- **Do** 聚焦态只用边框颜色变化（`focus:border-{color}-500`），不加 ring——保持干净。

### Don't:
- **Don't** 在非删除场景使用红色。红色只属于删除、重置密码、退出登录——这些操作需要用户的额外注意力。
- **Don't** 引入任何 web font。系统字体在中文本地化场景渲染质量最高，且 QQ 内置浏览器对 web font 支持不稳定。
- **Don't** 叠加卡片（卡片里套卡片）。账本模型的层次只有一级：卡片在背景上。嵌套卡片破坏「纸张叠放」的隐喻。
- **Don't** 使用超过 4 级的功能色。现有的 7 个功能域（蓝黄绿粉紫靛琥珀）+ 红色（危险）已经覆盖了所有场景。不添加新颜色来区分新功能——用现有颜色或灰色。
- **Don't** 模仿企业后台管理面板的灰色调。如果整个屏幕只有灰白蓝，说明色彩分区策略没有被应用。
