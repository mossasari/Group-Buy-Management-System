# 谷圈云端排单管理系统

 **Design by 秋洛 (QiuLuo)** 

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mossasari/Group-Buy-Management-System)

一个专为”二次元吃谷、拼团、代购”量身打造的**轻量级、无服务器 (Serverless) 纯前端排单系统**。

告别杂乱无章的 Excel 表格、繁琐的找人补邮、混乱的快递单号。让团长轻松管理，让团员自助查单！

🌐**图文教程站：** [qiuluo.netlify.app](https://qiuluo.netlify.app)

📕**小红书主页：** [特蕾西娅全肯定bot](https://xhslink.cn/m/83wcvC8Rc2i)

---
## 适用范围

本项目适用于：

* 吧唧、立牌、纸片等二次元谷子、ip的拼团管理。
  
* 需要处理复杂“排发”、“交肾（补款）”、“囤货地管理”的团长。
  
* 希望有一个免登录查询中心供团员自助查单，且无需额外开支。
---

## 许可协议与使用界限 (License & Usage Boundaries)

本项目采用 **CC BY-NC-SA 4.0 (署名-非商业性使用-相同方式共享 4.0 国际) [<sup>1</sup>](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh)** 协议开源。

为了保护原作者的著作权，任何人使用、Fork、修改或二次分发本项目代码，**必须严格遵守以下界限**：

1. **必须署名 (Attribution)：** 必须在衍生项目的显著位置（如页面底部、系统首页及 README 中）明确标明原作者为 **秋洛**，并附带原项目教程地址（https://qiuluo.netlify.app ）。
   
2.. **非商业性使用 (Non-Commercial)：** **【红线】** 严禁将本源码、衍生修改版用于任何形式的商业盈利、倒卖、或包装为付费SaaS产品。
   
3. **相同方式共享 (ShareAlike)：** 如果您修改了本代码，您必须将修改后的版本**以相同的开源协议公开分享**。严禁私下闭源传播或私自独占修改成果。

> **致开发者：** 只要您遵循以上三点（保留署名、不拿去卖钱、修改后同样开源），您可以自由地修改代码、增加新功能。如果您在原版基础上开发了非常好用的新功能，欢迎随时与我联系合并，让我们一起把它变得更好！

---

## 核心功能架构 (Features)

### 团长管理端（需登录访问）
* **智能数据导入：** 支持快捷手动录入，或通过 Excel/CSV 一键批量导入复杂排单。
* **图床与柄图库：** 内置图床直传接口，支持本地上传或直链粘贴。
* **智能肾表与交肾审核：** 自动聚合生成排表&肾表并支持一键导出长图。后台可视化审核团员提交的付款截图。
* **多仓排发管理：** 支持为不同团期分配不同“囤货地（仓库）”，分别设置邮费与收款码。在线审核发货申请，一键填入快递单号并上传发货平铺图。

### 团员自助端（免登录访问）
* **密钥+CN 防隐私泄露：** 团员只需输入团长设置的“全局密钥”和“完整CN”即可访问专属数据。
* **订单总览与交肾：** 自动汇总所有未交款项，合并生成付款单，支持一键上传转账截图。
* **智能排发申请：** 自动过滤未到货/未交肾商品。强制“同仓库合并发货”防呆校验，支持手指滑动屏幕**连选**谷子。
* **清单自由导出：** 内置排发 List 生成器，支持自由拖拽排序，支持按“团期大标题”或“谷子明细”按需导出文字或长图，方便直接排发。
* **吃谷成就排名：** 趣味系统，根据录入数据自动计算该团员在本团的“吃谷总数”与“消费金额”排位。

更多功能介绍详见教程站：[qiuluo.netlify.app](https://qiuluo.netlify.app)

---

## 技术栈 (Tech Stack)

* **前端框架：** HTML5, Vanilla JavaScript, CSS3
* **UI 样式：** Tailwind CSS (CDN 引入)
* **后端 / 数据库 / 鉴权：** Supabase (PostgreSQL, GoTrue)
* **图片托管：** esaimg.cdn1.vip（内置图床 API，团长上传图片后自动转存）
* **核心插件：** 
  * `xlsx.full.min.js` (Excel 数据解析)
  * `html2canvas.min.js` (DOM 元素截图导出)

---

## 未来更新计划 (Roadmap)

* [ ] 删掉不必要的功能
      
* [x] 涉及上传图片的功能可以直接在网站内上传后直接图床转存
      
* [ ] 交肾/排发订单团长会收到提醒
      
* [ ] 新增管理入口，可以分开管理团内事务（现阶段只能一个号两边用）

* [ ] 界面美化（皮肤系统）
      
* [ ] 推车收集和自动算捆功能
      
* [ ] 更解放大脑的自动凑单功能
     
* [ ] 更多灵机一动的鬼脑功能

---

## 开发者快速部署指南 (Quick Start)

对于小白团长，请直接访问 官方教程 [qiuluo.netlify.app](https://qiuluo.netlify.app) 查阅图文部署步骤。
对于开发者，可以通过以下步骤快速复刻本项目：

1. 克隆本仓库。
2. 在 [Supabase](https://supabase.com/) 创建新项目。
3. 在 Supabase SQL Editor 中运行以下初始化脚本，建立表结构并配置 RLS 权限：

```sql
-- 1. 创建核心数据表 (自带级联删除)
CREATE TABLE leader_data (
  user_id uuid references auth.users ON DELETE CASCADE primary key, 
  query_key text unique,                                            
  group_data jsonb default '[]',                                    
  image_data jsonb default '{}',                                    
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 开启行级安全策略 (RLS)
ALTER TABLE leader_data ENABLE ROW LEVEL SECURITY;

-- 3. 团长增删改查自己数据的权限
CREATE POLICY "团长完全管理自己的数据" ON leader_data
  FOR ALL USING (auth.uid() = user_id);

-- 4. 团员免登录查询权限
CREATE POLICY "允许公开读取数据" ON leader_data
  FOR SELECT USING (true);

-- 5. 团员免登录提交申请权限
CREATE POLICY "允许公开提交申请" ON leader_data
  FOR UPDATE USING (true) WITH CHECK (true);
```
4. 提取您的 Supabase URL 和 ANON KEY。
5. 在 index.html 的配置区替换常量：
```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```
6. （可选）在 Supabase 开启 Custom SMTP 以解锁无限制的邮箱注册功能。
7. 部署整个项目文件夹到任意静态托管平台 (Netlify, Vercel, GitHub Pages) 即可运行。推荐点击上方 Deploy to Netlify 按钮一键部署！

---

## ⚠️ 安全注意事项 (Security)

### Supabase RLS 权限

本项目使用 Supabase 行级安全 (RLS) 策略。SQL 初始化脚本中的 `"允许公开提交申请"` 策略允许**任何人知道 query_key 后修改数据**。这是为了让团员免登录提交申请而做的权衡。

**加固建议（强烈推荐）：**
1. 在 Supabase 控制台 → Authentication → Settings 中开启邮箱确认
2. 定期更换 `query_key`
3. 不要将 Supabase Service Role Key 放入前端代码（ANON_KEY 已足够）
4. 在 Supabase 控制台开启 RLS 审计日志

### XSS 防护

代码中已内置 `escapeHtml()` 函数防止跨站脚本攻击（XSS）。新增功能时请确保所有用户/云端数据在插入 DOM 前经过转义。

---

## 项目结构

```
├── index.html              # 主页面（HTML 骨架，~600 行）
├── css/
│   └── styles.css          # 自定义样式
├── js/
│   ├── core.js             # 基础工具函数 + escapeHtml()
│   ├── data.js             # 数据层 / 云端同步
│   ├── auth.js             # 认证模块
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
├── CONTRIBUTING.md         # 贡献指南
└── netlify.toml            # 部署配置 + 安全头
```

---

## 参与贡献 (Contributing)

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

发现 Bug 或者有很棒的新功能想法？
1. Fork 本仓库
2. 创建您的 Feature 分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

OR

直接在小红书联系我！

**再次感谢每一位为本项目提供建议与支持的朋友！愿天下没有难理的排表！**


