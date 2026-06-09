# 易象 (Yixiang) — 现代命理解读

基于传统易学智慧，用现代 Web 界面呈现**每日运势**、**八字排盘**、**姻缘配对**、**六爻占卦**与**黄历查询**。登录后可获取 AI 生成的深度详批报告。

🔗 **线上演示**: [yixiang-ivory.vercel.app](https://yixiang-ivory.vercel.app)

---

## ✨ 功能模块

| 模块 | 说明 | 核心能力 |
|------|------|----------|
| ☀️ **今日运势** | 每日吉凶宜忌、五行日柱、吉神凶煞、吉时吉方、生肖运势 | 基于真实黄历数据实时生成 |
| ☯️ **生辰八字** | 四柱排盘、五行分布、十神分析、大运流年、调候用神 | 完整八字计算 + 专业报告 |
| 💑 **姻缘配对** | 双方合婚 / 单人姻缘分析 | 日柱关系、五行互补、纳音、生肖、大运同步、财官互动、桃花运、婚期推算 |
| ☰ **六爻占卜** | 三钱六摇起卦、动爻解读、卦象方向 | 本卦 + 变卦 + 爻辞解读 |
| 📅 **每日黄历** | 农历日期、干支、节气、宜忌、吉神凶煞、喜神财神方位 | 支持日期切换查询 |
| 📊 **深度详批** | 八字深度报告（登录后可用） | AI 辅助生成结构化命理报告 |
| 👤 **用户系统** | 注册 / 登录 / 账户管理 | Supabase 认证 + Cloudflare Turnstile 防护 |

## 🧭 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **语言** | [TypeScript](https://www.typescriptlang.org/) |
| **样式** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **数据库** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **认证** | [Supabase Auth](https://supabase.com/auth) (邮箱 + 密码) + 本地开发兜底 |
| **安全** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) 人机验证 |
| **命理计算** | [lunar-javascript](https://github.com/6tail/lunar-javascript)（农历/八字/黄历） |
| **PWA** | Service Worker + Web Manifest，支持桌面安装 |
| **部署** | [Vercel](https://vercel.com/) |
| **测试** | [Vitest](https://vitest.dev/) |

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx              # 首页
│   ├── layout.tsx            # 根布局 (Navbar + Footer + ThemeProvider)
│   ├── bazi/                 # 八字排盘页
│   ├── iching/               # 六爻占卜页
│   ├── marriage/             # 姻缘配对页
│   ├── fortune/              # 今日运势页
│   ├── huangli/              # 黄历页
│   ├── login/                # 登录页
│   ├── register/             # 注册页
│   ├── me/                   # 个人中心
│   ├── reports/              # 深度报告页
│   ├── auth/                 # 认证回调
│   └── api/                  # API 路由
│       ├── bazi/             # 八字计算 API
│       ├── iching/           # 六爻起卦 API
│       ├── marriage/         # 姻缘分析 API
│       ├── fortune/          # 运势 API
│       ├── huangli/          # 黄历 API
│       ├── auth/             # 认证 API (注册/登录/Turnstile)
│       ├── me/               # 用户信息 API
│       └── reports/          # 深度报告 CRUD API
├── components/               # React 组件
│   ├── layout/               # 布局组件 (Navbar, Footer, ThemeToggle)
│   ├── ui/                   # 通用 UI 组件 (Button, Card, SectionTitle, PillarCard...)
│   ├── bazi/                 # 八字相关组件
│   ├── iching/               # 六爻相关组件
│   ├── marriage/             # 姻缘相关组件
│   ├── fortune/              # 运势相关组件
│   ├── huangli/              # 黄历相关组件
│   └── home/                 # 首页组件
├── lib/                      # 核心逻辑库
│   ├── bazi.ts               # 八字排盘计算
│   ├── bazi-deep-report.ts   # 八字深度报告生成
│   ├── iching.ts             # 六爻起卦与卦象解读
│   ├── iching-data.ts        # 64 卦数据
│   ├── marriage.ts           # 姻缘配对 / 单人姻缘分析
│   ├── marriage-deep-report.ts # 姻缘深度报告
│   ├── calendar.ts           # 黄历 / 农历数据
│   ├── shensha.ts            # 神煞计算
│   ├── stems.ts              # 干支 / 五行数据
│   ├── types.ts              # TypeScript 类型定义
│   ├── templates/            # 解读文案模板
│   ├── supabase/             # Supabase 客户端 (server/client)
│   ├── auth-utils.ts         # 认证工具
│   ├── local-auth.ts         # 本地开发认证兜底
│   ├── prisma.ts             # Prisma 客户端
│   ├── cache.ts              # 缓存工具
│   └── account.ts            # 账户管理
└── types/                    # 外部类型声明
```

## 🚀 本地开发

### 环境要求

- **Node.js** ≥ 18
- **PostgreSQL** 数据库（推荐 [Supabase](https://supabase.com/) 免费 tier）

### 启动步骤

```bash
# 1. 克隆仓库
git clone https://github.com/ShaneYa0/yixiang.git
cd yixiang

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入：
#   DATABASE_URL          — PostgreSQL 连接串
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

> 💡 **无需数据库也可体验大部分功能**：未配置 Supabase 时，系统会自动降级使用本地认证兜底，八字、六爻、运势、黄历等核心功能均可正常使用，仅深度报告需要数据库。

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbo) |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 代码检查 |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run typecheck` | TypeScript 类型检查 |

## 🌐 部署

项目针对 Vercel 平台优化：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShaneYa0/yixiang)

部署前请确保在 Vercel 项目设置中配置好以下环境变量：

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 设计理念

- **传统智慧 + 现代体验**：以黑白灰为主调的极简 UI，将复杂的命理数据结构化为清晰的可视化卡片
- **离线可用**：PWA 支持，一次加载后可在弱网/离线环境下使用基础功能
- **渐进增强**：核心命理功能无需登录即可使用；深度报告和记录存储需要登录
- **安全第一**：表单提交受 Cloudflare Turnstile 保护，密码使用 Supabase 安全存储

## 📄 许可

[MIT](LICENSE)
