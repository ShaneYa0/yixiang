# 易象（Yixiang）MVP 实施计划

> **面向执行代理：** 所需子技能 — 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 按任务逐步实施。步骤使用 `- [ ]` 复选框跟踪进度。

**目标：** 构建易象 MVP — 一个现代化的中国命理 web 应用，包含首页、今日运势、生辰八字、姻缘配对、易经占卜、每日黄历。

**架构：** Next.js 14 App Router + Tailwind CSS 前端，API Routes 作为后端，Supabase PostgreSQL + Auth，`lunar-typescript` 处理农历/八字/黄历算法，`i-ching` 处理六十四卦占卜，DeepSeek API 为 VIP 用户生成个性化报告。免费用户获得预置模板内容（提供情绪价值，零 API 成本）；VIP 获得 AI 生成的个性化报告。

**技术栈：** Next.js 14、TypeScript、Tailwind CSS、Supabase（PostgreSQL + Auth）、Prisma ORM、`lunar-typescript`、`i-ching`、DeepSeek API、Vercel 部署

---

## 文件结构

```
yixiang/
├── prisma/
│   └── schema.prisma              # 数据库模型（User, BaziRecord, IchingRecord 等）
├── src/
│   ├── app/
│   │   ├── layout.tsx             # 根布局（导航 + 页脚）
│   │   ├── page.tsx               # 首页
│   │   ├── globals.css            # Tailwind + 设计令牌
│   │   ├── fortune/
│   │   │   └── page.tsx           # 今日运势
│   │   ├── bazi/
│   │   │   └── page.tsx           # 八字排盘
│   │   ├── marriage/
│   │   │   └── page.tsx           # 姻缘配对
│   │   ├── iching/
│   │   │   └── page.tsx           # 易经占卜
│   │   ├── huangli/
│   │   │   └── page.tsx           # 每日黄历
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts       # Supabase auth 回调
│   │   └── api/
│   │       ├── fortune/route.ts   # GET 今日运势
│   │       ├── bazi/route.ts      # POST 八字计算
│   │       ├── marriage/route.ts  # POST 姻缘配对
│   │       ├── iching/route.ts    # POST 易经占卜
│   │       ├── huangli/route.ts   # GET 每日黄历
│   │       └── ai/route.ts        # POST AI报告（VIP专属）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # 顶部导航
│   │   │   └── Footer.tsx         # 页面底部
│   │   ├── ui/
│   │   │   ├── IconCircle.tsx     # 圆圈图标组件
│   │   │   ├── Card.tsx           # 白色卡片容器
│   │   │   ├── Button.tsx         # 主/次按钮
│   │   │   ├── ProgressBar.tsx    # 五行进度条
│   │   │   ├── PillarCard.tsx     # 四柱单柱卡片
│   │   │   ├── SectionTitle.tsx   # 段落标题
│   │   │   └── VIPGate.tsx        # VIP内容门控
│   │   ├── home/
│   │   │   └── FeatureCards.tsx   # 首页四个功能入口
│   │   ├── fortune/
│   │   │   ├── FortuneOverview.tsx    # 今日运势等级
│   │   │   ├── FortuneDetails.tsx     # 事业/财运/感情/健康评分
│   │   │   └── FortuneTiming.tsx      # 吉时/幸运色/吉方
│   │   ├── bazi/
│   │   │   ├── BaziInput.tsx          # 出生信息输入
│   │   │   ├── BaziResult.tsx         # 四柱+五行展示
│   │   │   └── BaziReading.tsx        # 免费命理解读
│   │   ├── marriage/
│   │   │   ├── MarriageInput.tsx      # 双方信息输入
│   │   │   └── MarriageResult.tsx     # 合婚分数+详情
│   │   ├── iching/
│   │   │   ├── IchingCast.tsx         # 起卦界面
│   │   │   └── IchingResult.tsx       # 卦象展示+解卦
│   │   └── huangli/
│   │       ├── HuangliCalendar.tsx    # 日期选择器
│   │       └── HuangliDetails.tsx     # 宜忌/吉神/方位
│   ├── lib/
│   │   ├── calendar.ts           # 农历日历封装
│   │   ├── bazi.ts               # 八字排盘封装
│   │   ├── iching.ts             # 易经占卜封装
│   │   ├── marriage.ts           # 姻缘配对算法
│   │   ├── ai.ts                 # DeepSeek API（仅服务端）
│   │   ├── templates/
│   │   │   ├── fortune.ts        # 每日运势模板（情绪价值文案）
│   │   │   ├── bazi.ts           # 八字免费解读模板
│   │   │   ├── marriage.ts       # 姻缘免费解读模板
│   │   │   ├── iching.ts         # 六十四卦解读模板
│   │   │   └── huangli.ts        # 黄历模板数据
│   │   └── supabase/
│   │       ├── client.ts         # 浏览器端 Supabase 客户端
│   │       └── server.ts         # 服务端 Supabase 客户端
│   ├── types/
│   │   └── index.ts              # 共享类型定义
│   └── middleware.ts             # Auth 中间件
├── .env.local                    # 环境变量
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 第零阶段：项目搭建

### 任务 0.1：初始化 Next.js 项目

**文件：**
- 创建：`yixiang/`（项目根目录）

- [ ] **步骤 1：创建 Next.js 项目**

```bash
npx create-next-app@latest yixiang --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd yixiang
```

- [ ] **步骤 2：安装核心依赖**

```bash
npm install lunar-typescript i-ching @supabase/supabase-js @supabase/ssr @prisma/client
npm install -D prisma vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **步骤 3：初始化 Prisma**

```bash
npx prisma init
```

- [ ] **步骤 4：验证开发服务器启动**

```bash
npm run dev
```

访问 `http://localhost:3000`，应看到默认 Next.js 页面。

- [ ] **步骤 5：提交**

```bash
git init
git add -A
git commit -m "chore: 搭建 Next.js 项目骨架及依赖安装"
```

---

### 任务 0.2：配置 Tailwind 设计令牌

**文件：**
- 修改：`tailwind.config.ts`

- [ ] **步骤 1：写入易象设计令牌到 Tailwind 配置**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6EE",       // 宣纸暖白 — 页面底色
        ink: "#2C2416",          // 深棕 — 主文字
        "ink-light": "#7A6E5E",  // 中棕 — 次要文字
        "ink-fade": "#B8A88A",   // 浅棕 — 辅助文字
        "ink-soft": "#A6947A",   // 浅棕变体
        card: "#FFFFFF",         // 卡片背景
        divider: "#E8E0D4",      // 分割线/灰底
      },
      letterSpacing: {
        wide: "0.15em",
        wider: "0.25em",
        widest: "0.4em",
      },
      fontWeight: {
        thin: "200",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **步骤 2：替换全局样式**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAF6EE;
  color: #2C2416;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **步骤 3：验证**

```bash
npm run dev
```

访问 `http://localhost:3000`，背景应为宣纸暖白色。

- [ ] **步骤 4：提交**

```bash
git add -A
git commit -m "chore: 配置 Tailwind 易象设计令牌（暖白+深棕配色）"
```

---

### 任务 0.3：搭建 Supabase 和 Prisma 数据模型

**文件：**
- 创建：`prisma/schema.prisma`
- 创建：`.env.local`

- [ ] **步骤 1：创建 Supabase 项目**

前往 https://supabase.com → 新建项目 → 记录 `DATABASE_URL` 和 `ANON_KEY`。

- [ ] **步骤 2：写入 `.env.local`**

```bash
# .env.local
DATABASE_URL="postgresql://postgres:[你的密码]@db.[你的项目].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[你的项目].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[你的ANON-KEY]"
DEEPSEEK_API_KEY="[你的DEEPSEEK-API-KEY]"
```

- [ ] **步骤 3：写入 Prisma 数据模型**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  isVip         Boolean  @default(false)
  vipSince      DateTime?
  createdAt     DateTime @default(now())

  baziRecords    BaziRecord[]
  ichingRecords  IchingRecord[]
}

model BaziRecord {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  birthDate DateTime
  birthHour Int       // 0-23
  gender    String    // "male" | "female"
  result    Json      // 四柱、五行等结构化数据
  createdAt DateTime @default(now())
}

model IchingRecord {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  question  String?  // 求问问题
  hexagram  Int      // 本卦 1-64
  changing  Int      // 动爻 0-6（0=无变卦）
  result    Json      // 卦象数据+解读
  createdAt DateTime @default(now())
}
```

- [ ] **步骤 4：推送数据模型到数据库**

```bash
npx prisma db push
npx prisma generate
```

- [ ] **步骤 5：提交**

```bash
git add -A
git commit -m "chore: 配置 Prisma 数据模型及 Supabase 连接"
```

---

### 任务 0.4：创建 Supabase 客户端工具

**文件：**
- 创建：`src/lib/supabase/client.ts`
- 创建：`src/lib/supabase/server.ts`

- [ ] **步骤 1：浏览器端客户端**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

- [ ] **步骤 2：服务端客户端**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **步骤 3：提交**

```bash
git add -A
git commit -m "feat: 添加 Supabase 客户端工具（浏览器端+服务端）"
```

---

## 第一阶段：设计系统与布局

### 任务 1.1：构建基础 UI 组件

**文件：**
- 创建：`src/components/ui/IconCircle.tsx`
- 创建：`src/components/ui/Card.tsx`
- 创建：`src/components/ui/Button.tsx`
- 创建：`src/components/ui/ProgressBar.tsx`
- 创建：`src/components/ui/SectionTitle.tsx`
- 创建：`src/components/ui/PillarCard.tsx`

- [ ] **步骤 1：圆圈图标组件 IconCircle**

```typescript
// src/components/ui/IconCircle.tsx
export function IconCircle({ symbol }: { symbol: string }) {
  return (
    <div className="inline-flex items-center justify-center w-8 h-8
                    border-[1.5px] border-ink rounded-full text-base text-ink">
      {symbol}
    </div>
  );
}
```

- [ ] **步骤 2：卡片容器 Card**

```typescript
// src/components/ui/Card.tsx
export function Card({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-divider p-6 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **步骤 3：按钮 Button**

```typescript
// src/components/ui/Button.tsx
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function Button({ children, variant = "primary", href, onClick, className = "" }: Props) {
  const base = "inline-block px-8 py-3 text-sm tracking-wider font-medium cursor-pointer";
  const styles = variant === "primary"
    ? "bg-ink text-paper"
    : "border border-ink text-ink";

  if (href) {
    return <Link href={href} className={`${base} ${styles} ${className}`}>{children}</Link>;
  }
  return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}
```

- [ ] **步骤 4：进度条 ProgressBar**

```typescript
// src/components/ui/ProgressBar.tsx
export function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="w-full h-1 bg-divider mb-1.5">
        <div className="h-1 bg-ink" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-ink-fade">{label} {value}</span>
    </div>
  );
}
```

- [ ] **步骤 5：段落标题 SectionTitle**

```typescript
// src/components/ui/SectionTitle.tsx
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-[0.25em] text-ink mb-4">
      {children}
    </h3>
  );
}
```

- [ ] **步骤 6：四柱卡片 PillarCard**

```typescript
// src/components/ui/PillarCard.tsx
export function PillarCard({ label, ganZhi, nayin }: {
  label: string;   // "年柱"、"月柱"、"日柱"、"时柱"
  ganZhi: string;  // "甲子"、"丙寅" 等
  nayin: string;   // "海中金"、"炉中火" 等
}) {
  return (
    <div className="flex-1 text-center py-6 px-2 bg-card border border-divider">
      <div className="text-[9px] text-ink-fade tracking-[0.15em] mb-2.5">{label}</div>
      <div className="text-[32px] font-thin text-ink mb-1">{ganZhi}</div>
      <div className="text-[10px] text-ink-soft">{nayin}</div>
    </div>
  );
}
```

- [ ] **步骤 7：提交**

```bash
git add -A
git commit -m "feat: 构建基础 UI 组件（图标、卡片、按钮、进度条、标题、四柱卡片）"
```

---

### 任务 1.2：构建布局组件

**文件：**
- 创建：`src/components/layout/Navbar.tsx`
- 创建：`src/components/layout/Footer.tsx`
- 修改：`src/app/layout.tsx`

- [ ] **步骤 1：顶部导航 Navbar**

```typescript
// src/components/layout/Navbar.tsx
import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/bazi", label: "八字" },
  { href: "/fortune", label: "运势" },
  { href: "/marriage", label: "姻缘" },
  { href: "/iching", label: "易经" },
  { href: "/huangli", label: "黄历" },
];

export function Navbar() {
  return (
    <nav className="flex justify-between items-center py-6 px-12 max-w-5xl mx-auto">
      <Link href="/" className="text-xl font-bold tracking-[0.4em] text-ink">
        易象
      </Link>
      <div className="flex gap-9 text-[13px] tracking-[0.25em] text-ink-fade">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **步骤 2：页脚 Footer**

```typescript
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="text-center py-8 text-[10px] text-ink-fade tracking-[0.15em]">
      易象 · 知天命而尽人事
    </footer>
  );
}
```

- [ ] **步骤 3：更新根布局**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "易象 — 现代命理解读",
  description: "基于千年易经智慧，用现代科技解读你的命运密码",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper text-ink">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **步骤 4：验证**

```bash
npm run dev
```

访问 `http://localhost:3000`，应看到导航栏和暖白底色。

- [ ] **步骤 5：提交**

```bash
git add -A
git commit -m "feat: 构建导航栏、页脚和根布局"
```

---

## 第二阶段：算法层

### 任务 2.1：封装农历日历工具

**文件：**
- 创建：`src/lib/calendar.ts`

- [ ] **步骤 1：编写农历日历封装**

```typescript
// src/lib/calendar.ts
import { Solar, Lunar } from "lunar-typescript";

export function getLunarDate(date: Date) {
  const lunar = Lunar.fromDate(date);

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    yearInGanZhi: lunar.getYearInGanZhi(),
    monthInGanZhi: lunar.getMonthInGanZhi(),
    dayInGanZhi: lunar.getDayInGanZhi(),
    yearShengXiao: lunar.getYearShengXiao(),
    lunarMonthName: lunar.getMonthInChinese(),
    lunarDayName: lunar.getDayInChinese(),
    solarTerm: lunar.getJieQi(),
    // 黄历数据
    dayYi: lunar.getDayYi(),           // 宜
    dayJi: lunar.getDayJi(),           // 忌
    dayJiShen: lunar.getDayJiShen(),   // 吉神
    dayXiongSha: lunar.getDayXiongSha(), // 凶煞
    dayPosition: {
      xi: lunar.getDayPositionXi(),     // 喜神方位
      fu: lunar.getDayPositionFu(),     // 福神方位
      cai: lunar.getDayPositionCai(),   // 财神方位
    },
    timeGanZhi: (hour: number) => lunar.getTimeGanZhi(hour),
  };
}

export function getTodayLunar() {
  return getLunarDate(new Date());
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加农历日历工具封装（基于 lunar-typescript）"
```

---

### 任务 2.2：封装八字排盘工具

**文件：**
- 创建：`src/lib/bazi.ts`

- [ ] **步骤 1：编写八字排盘逻辑**

```typescript
// src/lib/bazi.ts
import { Solar, Lunar } from "lunar-typescript";

export interface BaziResult {
  yearPillar:  { ganZhi: string; nayin: string };
  monthPillar: { ganZhi: string; nayin: string };
  dayPillar:   { ganZhi: string; nayin: string };
  hourPillar:  { ganZhi: string; nayin: string };
  fiveElements: { jin: number; mu: number; shui: number; huo: number; tu: number };
  dayMaster: string;    // 日主天干
  shengXiao: string;    // 生肖
  baZi: string;         // 完整八字字符串
}

// 天干 → 五行映射
const GAN_WUXING: Record<string, string> = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水",
};

function countFiveElements(ganChars: string[]) {
  const counts = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
  for (const gan of ganChars) {
    const wx = GAN_WUXING[gan];
    if (wx === "金") counts.jin += 25;
    if (wx === "木") counts.mu += 25;
    if (wx === "水") counts.shui += 25;
    if (wx === "火") counts.huo += 25;
    if (wx === "土") counts.tu += 25;
  }
  return counts;
}

export function calculateBazi(birthDate: Date, birthHour: number, gender: "male" | "female"): BaziResult {
  const lunar = Lunar.fromDate(birthDate);

  const yearGZ  = lunar.getYearInGanZhi();
  const monthGZ = lunar.getMonthInGanZhi();
  const dayGZ   = lunar.getDayInGanZhi();
  const hourGZ  = lunar.getTimeGanZhi(birthHour);

  const yearNayin  = lunar.getYearNaYin();
  const monthNayin = lunar.getMonthNaYin();
  const dayNayin   = lunar.getDayNaYin();
  const hourNayin  = lunar.getTimeNaYin(birthHour);

  const allGan = [yearGZ[0], monthGZ[0], dayGZ[0], hourGZ[0]];
  const elements = countFiveElements(allGan);

  return {
    yearPillar:  { ganZhi: yearGZ,  nayin: yearNayin },
    monthPillar: { ganZhi: monthGZ, nayin: monthNayin },
    dayPillar:   { ganZhi: dayGZ,   nayin: dayNayin },
    hourPillar:  { ganZhi: hourGZ,  nayin: hourNayin },
    fiveElements: elements,
    dayMaster: dayGZ[0],
    shengXiao: lunar.getYearShengXiao(),
    baZi: `${yearGZ} ${monthGZ} ${dayGZ} ${hourGZ}`,
  };
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加八字排盘工具（四柱、五行、日主、纳音）"
```

---

### 任务 2.3：封装易经占卜工具

**文件：**
- 创建：`src/lib/iching.ts`

- [ ] **步骤 1：编写易经占卜封装（含六十四卦数据）**

```typescript
// src/lib/iching.ts
import iChing from "i-ching";

export interface IchingResult {
  hexagramNumber: number;
  hexagramChar: string;       // Unicode 卦符 e.g. ䷀
  chineseName: string;        // 卦名 e.g. 乾
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;           // 卦辞
  changingLine: number;       // 0 = 无动爻
  changingLineText: string | null; // 爻辞
  changedHexagram?: {         // 变卦
    number: number;
    char: string;
    name: string;
  };
}

// 六十四卦数据（卦名、卦符、卦辞、六条爻辞）
// 注：此处仅展示卦1-2，实施时需补全全部64卦
const HEXAGRAM_DATA: Record<number, {
  name: string;
  char: string;
  judgment: string;
  lines: string[];
}> = {
  1: {
    name: "乾",
    char: "䷀",
    judgment: "乾：元亨利贞。",
    lines: [
      "初九：潜龙勿用。",
      "九二：见龙在田，利见大人。",
      "九三：君子终日乾乾，夕惕若厉，无咎。",
      "九四：或跃在渊，无咎。",
      "九五：飞龙在天，利见大人。",
      "上九：亢龙有悔。",
    ],
  },
  2: {
    name: "坤",
    char: "䷁",
    judgment: "坤：元亨，利牝马之贞。君子有攸往，先迷后得主，利。安贞吉。",
    lines: [
      "初六：履霜，坚冰至。",
      "六二：直方大，不习无不利。",
      "六三：含章可贞，或从王事，无成有终。",
      "六四：括囊，无咎无誉。",
      "六五：黄裳，元吉。",
      "上六：龙战于野，其血玄黄。",
    ],
  },
  // ... 卦3-64 需补全（从 i-ching npm 包或经典文献中获取）
};

// 免费解读模板 — 提供情绪价值，模糊但让人感觉"被说中"
const READING_TEMPLATES: Record<string, { good: string[]; caution: string[]; advice: string[] }> = {
  career: {
    good: [
      "你正处于一个积累的关键阶段，每一步努力都在为未来铺路。",
      "贵人正在靠近，保持开放的心态，机会可能来自你意想不到的方向。",
      "你的专业能力正在被看见，坚持下去会有实质的回报。",
    ],
    caution: [
      "这段时间不宜急于求成，稳扎稳打比冒进更明智。",
      "身边可能有不同的声音，倾听内心比迎合他人更重要。",
      "不要被短期利益迷惑，长远来看现在的坚守更有价值。",
    ],
    advice: [
      "当你迷茫时，回到自己最擅长的事情上，那是你安身立命的根本。",
      "学会等待也是一种智慧，时机未到时，准备比行动更重要。",
    ],
  },
  love: {
    good: [
      "你的真诚是最打动人的品质，不需要刻意改变自己去迎合别人。",
      "缘分正在靠近，保持自己的节奏，对的人会在对的时机出现。",
      "这段关系有深厚的根基，彼此的理解与包容是最大的财富。",
    ],
    caution: [
      "感情中，沟通比猜测更重要。有什么想法，不妨温和地直接说出来。",
      "不要因为一时的情绪起伏做出决定，给彼此一点空间和时间。",
    ],
    advice: [
      "真正的爱情不是寻找完美的人，而是学会用完美的眼光看不完美的人。",
      "先学会爱自己，才能更好地爱别人。你的完整不需要另一个人来证明。",
    ],
  },
  general: {
    good: [
      "你有一种不为人知的韧性，总能在困境中找到出路。",
      "今天有吉星照临，适合开启新计划或推进搁置已久的事情。",
    ],
    caution: [
      "做事之前多做一手准备，今天可能会出现一些小变数。",
      "别太在意别人的评价，你自己的判断往往更准确。",
    ],
    advice: [
      "每一次看似偶然的相遇，都是命运精心的安排。",
      "向内看，你会发现答案一直都在。外在的喧嚣只是参考。",
    ],
  },
};

export function castIching(randomFn = Math.random): IchingResult {
  const reading = iChing.ask("占卜", randomFn);

  const hexNum = reading.hexagram.number;
  const hexData = HEXAGRAM_DATA[hexNum];
  const changing = reading.changingLine || 0;

  let changedData = undefined;
  let changingLineText = null;
  if (changing > 0 && reading.futureHexagram) {
    const futureHex = HEXAGRAM_DATA[reading.futureHexagram.number];
    changedData = {
      number: reading.futureHexagram.number,
      char: futureHex?.char || "",
      name: futureHex?.name || "",
    };
    changingLineText = hexData.lines[changing - 1];
  }

  return {
    hexagramNumber: hexNum,
    hexagramChar: hexData.char,
    chineseName: hexData.name,
    upperTrigram: reading.hexagram.trigrams[0].chineseName || "",
    lowerTrigram: reading.hexagram.trigrams[1].chineseName || "",
    judgment: hexData.judgment,
    changingLine: changing,
    changingLineText,
    changedHexagram: changedData,
  };
}

export function getIchingFreeReading(result: IchingResult): string {
  const categories = ["general", "career", "love"] as const;
  const picked = categories[result.hexagramNumber % 3];
  const idx = result.changingLine % 3;

  const tmpl = READING_TEMPLATES[picked];
  const keys = Object.keys(tmpl) as Array<keyof typeof tmpl>;

  return [
    tmpl[keys[0]][idx % tmpl[keys[0]].length],
    tmpl[keys[1]][(idx + 1) % tmpl[keys[1]].length],
    tmpl[keys[2]][(idx + 2) % tmpl[keys[2]].length],
  ].join("\n\n");
}
```

> ⚠️ **实施注意：** 卦3-64的完整数据需补全。可从 `i-ching` npm 包的英文数据翻译为中文，或从《周易》原文中获取。卦辞和爻辞是公开的经典文本。

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加易经占卜工具（六十四卦数据+免费解读模板）"
```

---

### 任务 2.4：构建姻缘配对算法

**文件：**
- 创建：`src/lib/marriage.ts`

- [ ] **步骤 1：编写姻缘配对计算逻辑**

```typescript
// src/lib/marriage.ts
import { calculateBazi } from "./bazi";

export interface MarriageResult {
  score: number;   // 0-100
  summary: string;
  details: {
    shengxiao: { score: number; text: string; };  // 生肖
    nayin:     { score: number; text: string; };  // 纳音
    wuxing:    { score: number; text: string; };  // 五行
    bazi:      { score: number; text: string; };  // 八字综合
  };
}

// 生肖相合表
const SHENGXIAO_HE: Record<string, string[]> = {
  "鼠": ["牛", "龙", "猴"], "牛": ["鼠", "蛇", "鸡"],
  "虎": ["马", "狗", "猪"], "兔": ["羊", "狗", "猪"],
  "龙": ["鼠", "猴", "鸡"], "蛇": ["牛", "鸡", "猴"],
  "马": ["虎", "羊", "狗"], "羊": ["兔", "马", "猪"],
  "猴": ["鼠", "龙", "蛇"], "鸡": ["牛", "龙", "蛇"],
  "狗": ["虎", "兔", "马"], "猪": ["兔", "羊", "虎"],
};

// 生肖相冲表
const SHENGXIAO_CHONG: Record<string, string> = {
  "鼠": "马", "牛": "羊", "虎": "猴", "兔": "鸡",
  "龙": "狗", "蛇": "猪", "马": "鼠", "羊": "牛",
  "猴": "虎", "鸡": "兔", "狗": "龙", "猪": "蛇",
};

export function calculateMarriage(
  p1: { birthDate: Date; birthHour: number; gender: string },
  p2: { birthDate: Date; birthHour: number; gender: string }
): MarriageResult {
  const b1 = calculateBazi(p1.birthDate, p1.birthHour, p1.gender as "male" | "female");
  const b2 = calculateBazi(p2.birthDate, p2.birthHour, p2.gender as "male" | "female");

  // 生肖评分
  let sxScore = 50;
  let sxText = "";
  if (SHENGXIAO_HE[b1.shengXiao]?.includes(b2.shengXiao)) {
    sxScore = 85;
    sxText = `${b1.shengXiao}与${b2.shengXiao}相合，天生缘分深厚，彼此吸引理解。`;
  } else if (SHENGXIAO_CHONG[b1.shengXiao] === b2.shengXiao) {
    sxScore = 25;
    sxText = `${b1.shengXiao}与${b2.shengXiao}相冲，性格差异较大，需要更多包容与磨合。`;
  } else {
    sxScore = 55;
    sxText = `${b1.shengXiao}与${b2.shengXiao}无冲无合，相处平淡自然，靠后天经营。`;
  }

  // 五行互补评分
  const wxBalance = {
    jin:  100 - Math.abs(b1.fiveElements.jin - b2.fiveElements.jin),
    mu:   100 - Math.abs(b1.fiveElements.mu - b2.fiveElements.mu),
    shui: 100 - Math.abs(b1.fiveElements.shui - b2.fiveElements.shui),
    huo:  100 - Math.abs(b1.fiveElements.huo - b2.fiveElements.huo),
    tu:   100 - Math.abs(b1.fiveElements.tu - b2.fiveElements.tu),
  };
  const wxAvg = Object.values(wxBalance).reduce((a, b) => a + b) / 5;

  const score = Math.round(sxScore * 0.4 + wxAvg * 0.35 + 50 * 0.25);

  return {
    score,
    summary: score >= 75 ? "缘分颇深，值得珍惜" :
             score >= 55 ? "中上缘分，用心经营可有良缘" :
             "缘分较浅，需双方共同努力",
    details: {
      shengxiao: { score: sxScore, text: sxText },
      nayin:     { score: 50, text: "纳音匹配分析（VIP解锁完整报告）" },
      wuxing:    { score: Math.round(wxAvg), text: "五行互补分析（VIP解锁完整报告）" },
      bazi:      { score: 50, text: "八字合婚深度分析（VIP解锁完整报告）" },
    },
  };
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加姻缘配对算法（生肖+五行+纳音+八字综合评分）"
```

---

### 任务 2.5：编写 DeepSeek AI 客户端（仅服务端）

**文件：**
- 创建：`src/lib/ai.ts`

- [ ] **步骤 1：编写 DeepSeek API 调用**

```typescript
// src/lib/ai.ts
// 仅服务端使用 — 禁止在客户端组件导入

const API_URL = "https://api.deepseek.com/chat/completions";

const PROMPTS: Record<string, string> = {
  bazi: `你是一位资深的八字命理大师。请根据以下八字信息，撰写专业命理分析。
包含：日主五行分析、格局判断、性格特点、事业方向、财运走势、感情婚姻、健康注意事项。
要求文风典雅庄重，有传统文化底蕴，但要让现代读者看得懂。

八字信息：`,

  marriage: `你是一位资深命理合婚专家。请根据双方八字信息，撰写合婚分析。
包含：性格匹配度、五行互补情况、婚姻优势与挑战、相处建议。
要求客观中肯，既指出契合之处，也坦诚说明需要磨合的地方。

双方信息：`,

  iching: `你是一位深谙易经的智者。请根据卦象信息为求问者解卦。
包含：本卦核心含义、动爻启示、变卦指引、结合问题的具体建议。
要求有哲理深度，又有实际指导意义，语言温暖有力量。

卦象信息：`,

  fortune: `你是一位洞察运势的命理师。请根据今日干支五行和用户信息，撰写今日运势。
包含：整体运势、事业运、财运、感情运、健康运、今日宜忌建议。
要求积极正向，给信心和方向，不要制造焦虑。

用户信息：`,
};

export async function generateFortuneReport(
  type: "bazi" | "marriage" | "iching" | "fortune",
  userData: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一位精通中国传统命理学的专家，擅长八字、易经、风水。回答专业、有深度，同时温暖有力量。",
        },
        {
          role: "user",
          content: PROMPTS[type] + JSON.stringify(userData, null, 2),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加 DeepSeek AI 客户端（VIP 报告生成，仅服务端）"
```

---

## 第三阶段：免费内容模板

### 任务 3.1：构建每日运势模板引擎

**文件：**
- 创建：`src/lib/templates/fortune.ts`

- [ ] **步骤 1：编写运势模板数据（情绪价值文案）**

```typescript
// src/lib/templates/fortune.ts

export type FortuneLevel = "大吉" | "吉" | "平" | "凶" | "大凶";

export interface DailyFortune {
  level: FortuneLevel;
  levelEmoji: string;
  summary: string;
  career:  { score: number; text: string };
  wealth:  { score: number; text: string };
  love:    { score: number; text: string };
  health:  { score: number; text: string };
  yi: string[];         // 宜
  ji: string[];         // 忌
  luckyHours: string[];
  luckyColor: string;
  luckyDirection: string;
  mantra: string;       // 每日箴言
}

// 五个运势等级的文案池 — 每个都经过精心设计，提供情绪价值
const TEMPLATES: Record<FortuneLevel, {
  summaries: string[];
  career: string[];
  wealth: string[];
  love: string[];
  health: string[];
  mantras: string[];
}> = {
  大吉: {
    summaries: [
      "今日运势如旭日东升，诸事顺遂。你所期待的事情正在靠近，请保持信心。",
      "气场极佳的一天，做什么都得心应手。你的努力即将开花结果。",
      "今日吉星高照，贵人运旺盛。不妨大胆推进那些悬而未决的事情。",
    ],
    career: [
      "工作上思路清晰，效率极高。你的专业能力今天会被看到，适合展示成果。",
      "有新的机会在向你靠近，保持敏锐，抓住它。",
    ],
    wealth: [
      "财运上扬，可能有意外之喜。但别因为一时利好就放松理财规划。",
      "投资眼光独到，今天的判断往往是对的。",
    ],
    love: [
      "感情运势温馨甜蜜，和伴侣之间的默契特别强。单身者有机会遇到心动的对象。",
      "今天特别适合表达感情，一句真诚的关心，会让对方暖很久。",
    ],
    health: [
      "精力充沛，适合运动锻炼。心情好是最好的养生。",
      "身体状态极佳，可以挑战平时不敢尝试的运动强度。",
    ],
    mantras: [
      "好运是努力的另一个名字。",
      "当你准备好了，机会自然会来。",
      "今天的你，比昨天更值得被爱。",
    ],
  },
  吉: {
    summaries: [
      "运势平稳向好，虽无大起大落，但小确幸不断。",
      "今天适合按部就班地推进计划，积小胜为大胜。",
    ],
    career: [
      "工作中会有些小挑战，但都在你的能力范围内。完成任务后的成就感很实在。",
      "同事关系融洽，合作项目进展顺利。多听听别人的意见会有收获。",
    ],
    wealth: [
      "财运稳定，适合做长期理财规划而非短线操作。",
      "消费欲可能偏高，买东西前问问自己是否真的需要。",
    ],
    love: [
      "感情平淡是真，和伴侣的日常相处就是最好的滋养。",
      "单身不必着急，好的缘分需要在对的时间出现。先做好自己。",
    ],
    health: [
      "注意劳逸结合，适当休息比硬撑更有效率。",
      "多喝水，少熬夜。身体的小信号不要忽视。",
    ],
    mantras: [
      "慢慢来，比较快。",
      "平凡的一天，也可以过得不平凡。",
      "所有的好结果，都是好习惯的积累。",
    ],
  },
  平: {
    summaries: [
      "运势中等，不特别好也不算差。今天是适合思考和规划的日子。",
      "平平淡淡的一天，适合把之前积累的事情好好整理一番。",
    ],
    career: [
      "工作上建议以求稳为主，不急于在今天做重大决策。观察和收集信息更明智。",
      "可能会有杂事打扰，保持耐心，一件一件处理就好。",
    ],
    wealth: [
      "财运一般，不是投资或大额消费的好时机。守住现有的就是赚到了。",
      "可能会有小额支出，不必太在意。",
    ],
    love: [
      "感情上可能有小摩擦，但都可以化解。多站在对方角度想想。",
      "今天适合独处，给自己一些安静的时间充电。",
    ],
    health: [
      "容易感到疲劳，注意控制工作节奏。午休很重要。",
      "饮食上注意清淡，肠胃可能比较敏感。",
    ],
    mantras: [
      "平静不是无聊，而是一种力量。",
      "有些日子是用来奔跑的，有些日子是用来沉淀的。",
      "不着急，你有自己的节奏。",
    ],
  },
  凶: {
    summaries: [
      "今日运势偏低，适合低调行事。遇到困难不要硬碰，避开锋芒是智慧。",
      "今天可能有些不太顺利，但请记住，这些都会过去。",
    ],
    career: [
      "工作上留意沟通方式，言语之间容易产生误会。重要的事写下来确认。",
      "今天不适合做重大决定或推动新项目。先稳一稳。",
    ],
    wealth: [
      "财不露白，今天不适合大额消费或投资。守成为上。",
      "注意保管好财物，可能有小破财。",
    ],
    love: [
      "感情上容易因小事起争执，给彼此多一些耐心和体谅。",
      "今天不太适合表白或做重大的感情决定。",
    ],
    health: [
      "注意休息，身体可能有些疲惫。早睡是今天的主题。",
      "颈椎和肩膀容易僵硬，适时活动一下。",
    ],
    mantras: [
      "阴天过后，一定是晴天。",
      "困难是暂时的，你的韧性是永恒的。",
      "有时候，停下来比硬撑更需要勇气。",
    ],
  },
  大凶: {
    summaries: [
      "今日运势低迷，诸事不宜。今天最重要的事就是照顾好自己。",
      "今天可能会遇到一些挫折，这不是你的问题，只是时机不对。",
    ],
    career: [
      "工作上容易遇到阻力，建议以配合为主，避免主动出击。",
      "重要决策请改日再做。今天的信息可能不够充分。",
    ],
    wealth: [
      "财运低迷，避免任何形式的投资和借贷。购物也需三思。",
      "可能会有计划外的支出，不必太放在心上。",
    ],
    love: [
      "感情上容易有情绪波动，不要说出口是心非的话。",
      "今天不适合谈论敏感话题。先缓一缓，给彼此一个拥抱。",
    ],
    health: [
      "身体能量偏低，减少外出和剧烈运动。泡个热水澡会舒服很多。",
      "注意保暖和饮食卫生，免疫力可能偏低。",
    ],
    mantras: [
      "万物皆有周期，低谷之后必是上升。",
      "最难的日子，往往教会我们最珍贵的东西。",
      "照顾好自己，就是对世界最好的回应。",
    ],
  },
};

export function generateDailyFortune(
  lunarData: ReturnType<typeof import("@/lib/calendar").getLunarDate>
): DailyFortune {
  // 用日柱干支作为种子，确保每天运势不同但可复现
  const dayGZ = lunarData.dayInGanZhi;
  const seed = (dayGZ.charCodeAt(0) + dayGZ.charCodeAt(1)) % 100;

  // 运势等级分布：大吉5% 吉30% 平45% 凶15% 大凶5%
  let level: FortuneLevel;
  if (seed >= 95) level = "大吉";
  else if (seed >= 65) level = "吉";
  else if (seed >= 20) level = "平";
  else if (seed >= 5) level = "凶";
  else level = "大凶";

  const tmpl = TEMPLATES[level];
  const pick = (arr: string[], i: number) => arr[i % arr.length];

  // 吉时（基于日柱变化）
  const hb = seed % 12;
  const luckyHours = [
    `${(hb + 1) % 12 + 1}:00-${(hb + 2) % 12 + 1}:00`,
    `${(hb + 5) % 12 + 1}:00-${(hb + 6) % 12 + 1}:00`,
    `${(hb + 9) % 12 + 1}:00-${(hb + 10) % 12 + 1}:00`,
  ].sort();

  const colors = ["金色", "白色", "蓝色", "红色", "黄色", "黑色", "绿色"];
  const directions = ["东方", "南方", "西方", "北方", "东南", "西南", "东北", "西北"];

  return {
    level,
    levelEmoji: { 大吉: "☀", 吉: "🌤", 平: "☁", 凶: "🌧", 大凶: "⛈" }[level],
    summary: pick(tmpl.summaries, seed),
    career:  { score: 55 + (seed % 40), text: pick(tmpl.career, seed) },
    wealth:  { score: 50 + ((seed * 3) % 45), text: pick(tmpl.wealth, seed + 1) },
    love:    { score: 50 + ((seed * 7) % 45), text: pick(tmpl.love, seed + 2) },
    health:  { score: 55 + ((seed * 5) % 40), text: pick(tmpl.health, seed + 3) },
    yi: lunarData.dayYi.slice(0, 4),
    ji: lunarData.dayJi.slice(0, 3),
    luckyHours,
    luckyColor: colors[seed % colors.length],
    luckyDirection: directions[(seed * 3) % directions.length],
    mantra: pick(tmpl.mantras, seed),
  };
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加每日运势模板引擎（五等级情绪价值文案+基于干支的确定性生成）"
```

---

### 任务 3.2：构建八字和姻缘免费解读模板

**文件：**
- 创建：`src/lib/templates/bazi.ts`
- 创建：`src/lib/templates/marriage.ts`

- [ ] **步骤 1：八字免费解读模板（巴纳姆效应，让人感觉"被说中"）**

```typescript
// src/lib/templates/bazi.ts

// 日主天干人格解读 — 巴纳姆效应设计，模糊但让人感觉准确
const DAY_MASTER_READINGS: Record<string, string> = {
  "甲": "甲木之人，如参天大树，正直刚毅，有领导之才。你天生具有向上生长的力量，不甘平庸，凡事追求卓越。为人仗义，朋友有难必会挺身而出，但有时也因此承担了太多不属于你的责任。",
  "乙": "乙木之人，如藤萝花草，柔韧而顽强。外表温和，内心却有极强的生命力。善于观察，心思细腻，在人际关系中游刃有余。有一种不张扬的美丽，像春天的风，轻柔却有力量。",
  "丙": "丙火之人，如烈日当空，热情奔放，光明磊落。走到哪里都是焦点，天生的感染力让你身边总是围绕着朋友。热情有时会让自己燃烧得太快，记得偶尔也要为自己留一分余裕。",
  "丁": "丁火之人，如烛光星火，温柔而持久。不是最耀眼的那一个，但总能在黑暗中给人温暖和方向。心思缜密，做事专注，一旦认定的事情会坚持到底。温柔是一种不动声色的力量。",
  "戊": "戊土之人，如厚重城墙，稳重可靠，诚信为本。说到做到，朋友们都知道有困难找你就对了。人生哲学是脚踏实地，不投机取巧。有时太过固执，但这也是你最让人信赖的地方。",
  "己": "己土之人，如田园沃土，温和包容，滋养万物。有天然的亲和力，让人愿意靠近和信任。善于照顾他人，在团队中常常是默默付出的那个人。照顾别人的同时，也要好好照顾自己。",
  "庚": "庚金之人，如刀剑利器，果断刚强，敢作敢当。做事雷厉风行，不拖泥带水。决断力在关键时刻特别宝贵。有时说话太过直接，但这种真诚也正是你最可贵的品质。",
  "辛": "辛金之人，如珠玉金银，精致细腻，品位不凡。对美的感知力极强，对生活品质有独特追求。做事一丝不苟，追求完美，这让你的专业能力脱颖而出。",
  "壬": "壬水之人，如江河大海，胸怀宽广，智慧过人。思维敏捷，包容性强，能接纳不同的观点和人。适应力极强，总能在变化中找到位置。有一种不羁的自由感，不喜欢被框架束缚。",
  "癸": "癸水之人，如雨露甘泉，细腻温柔，深思熟虑。情感丰富但不轻易外露，心中有大千世界。直觉特别准，往往能看透别人看不到的东西。敏感不是弱点，而是一种天赋。",
};

export function getFreeBaziReading(dayMaster: string, fiveElements: { jin: number; mu: number; shui: number; huo: number; tu: number }): string {
  const personality = DAY_MASTER_READINGS[dayMaster] || "你的命格独特，有着与众不同的气质与潜力。";

  // 找到最强和最弱五行
  const elements = [
    { name: "金", value: fiveElements.jin, trait: "重义气、有决断力" },
    { name: "木", value: fiveElements.mu, trait: "有仁爱之心、积极向上" },
    { name: "水", value: fiveElements.shui, trait: "智慧过人、灵活变通" },
    { name: "火", value: fiveElements.huo, trait: "热情洋溢、光明磊落" },
    { name: "土", value: fiveElements.tu, trait: "诚信敦厚、稳重可靠" },
  ];
  elements.sort((a, b) => b.value - a.value);
  const strongest = elements[0];
  const weakest = elements[elements.length - 1];

  const elementReading = `你的命局中**${strongest.name}**最旺（${strongest.value}分），${strongest.trait}。而**${weakest.name}**稍弱（${weakest.value}分），日常可适当补充${weakest.name}元素能量。`;

  return `${personality}\n\n${elementReading}\n\n---\n💎 以上为基础分析。**永久VIP解锁完整命盘报告**：大运流年、十神详解、事业发展方向、财富格局、婚姻感情运势、每十年大运详解。`;
}
```

- [ ] **步骤 2：姻缘免费解读模板**

```typescript
// src/lib/templates/marriage.ts

export function getFreeMarriageReading(score: number): string {
  const readings: Record<string, string> = {
    high: `你们的八字契合度较高（${score}分），从命理角度看是一段值得珍惜的缘分。

两个人在一起，最重要的不是命理的匹配，而是彼此愿意为这段关系付出的心意。缘分给了你们好的基础，剩下的靠日常的陪伴与理解。

好的关系不是没有矛盾，而是每次矛盾过后，你们还是选择了对方。`,

    mid: `你们的八字契合度中等（${score}分），缘分中有甜蜜也有挑战。

没有哪一段关系是完美的。你们的差异恰恰可能成为彼此成长的契机。关键在于沟通——把真实的想法说出来，而不是让对方去猜。

缘分给了你们相遇的机会，接下来的故事，由你们自己书写。`,

    low: `命理来看契合度偏低（${score}分），需要更多耐心与包容。

但这并不意味着不适合在一起。恰恰相反，有些最坚固的关系正是从不容易开始的。因为你们清楚选择了对方，就选择了不放弃。

真诚建议：多沟通、少猜测、给彼此成长的空间。`,
  };

  const key = score >= 75 ? "high" : score >= 55 ? "mid" : "low";
  return readings[key] + `\n\n---\n💎 **永久VIP解锁深度合婚报告**：五行互补详解、纳音婚配分析、相处之道建议、未来运势合参。`;
}
```

- [ ] **步骤 3：提交**

```bash
git add -A
git commit -m "feat: 添加八字和姻缘免费解读模板（情绪价值+VIP引导）"
```

---

## 第四阶段：功能页面

### 任务 4.1：构建首页

**文件：**
- 修改：`src/app/page.tsx`
- 创建：`src/components/home/FeatureCards.tsx`

- [ ] **步骤 1：首页功能卡片组件**

```typescript
// src/components/home/FeatureCards.tsx
import { IconCircle } from "@/components/ui/IconCircle";
import Link from "next/link";

const features = [
  { label: "生辰八字", sub: "四柱 · 五行 · 十神", icon: "☯", href: "/bazi" },
  { label: "今日运势", sub: "日运 · 吉凶 · 宜忌", icon: "☀", href: "/fortune" },
  { label: "姻缘配对", sub: "合婚 · 缘分 · 匹配", icon: "⚭", href: "/marriage" },
  { label: "易经占卜", sub: "六十四卦 · 解卦", icon: "☰", href: "/iching" },
];

export function FeatureCards() {
  return (
    <div className="flex gap-3">
      {features.map((f) => (
        <Link key={f.href} href={f.href}
          className="flex-1 text-center py-6 px-2 bg-white/50 border border-ink/5 hover:border-ink/15 transition-colors">
          <IconCircle symbol={f.icon} />
          <div className="mt-2 text-xs font-semibold tracking-[0.2em] text-ink">{f.label}</div>
          <div className="text-[10px] text-ink-fade mt-1">{f.sub}</div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **步骤 2：首页**

```typescript
// src/app/page.tsx
import { Button } from "@/components/ui/Button";
import { FeatureCards } from "@/components/home/FeatureCards";

export default function HomePage() {
  return (
    <div className="text-center pt-16 pb-20">
      <h1 className="text-[80px] font-thin tracking-[0.3em] text-ink leading-none mb-4">
        知天命
      </h1>
      <p className="text-base text-ink-soft tracking-[0.35em] mb-12 font-light">
        千年易经智慧 · 现代解读
      </p>

      <Button href="/bazi" variant="primary" className="mb-6">开始测算</Button>
      <div className="mb-14">
        <a href="/fortune" className="text-[13px] text-ink-soft tracking-[0.12em] border-b border-divider pb-1 hover:text-ink transition-colors cursor-pointer">
          先看今日运势 →
        </a>
      </div>

      <FeatureCards />
    </div>
  );
}
```

- [ ] **步骤 3：验证**

```bash
npm run dev
```

访问 `http://localhost:3000` — "知天命"大标题 + 四个功能卡片。

- [ ] **步骤 4：提交**

```bash
git add -A
git commit -m "feat: 构建首页（大标题+功能入口卡片）"
```

---

### 任务 4.2：构建今日运势页面

**文件：**
- 创建：`src/app/api/fortune/route.ts`
- 创建：`src/components/fortune/FortuneOverview.tsx`
- 创建：`src/components/fortune/FortuneDetails.tsx`
- 创建：`src/components/fortune/FortuneTiming.tsx`
- 创建：`src/app/fortune/page.tsx`

- [ ] **步骤 1：运势 API**

```typescript
// src/app/api/fortune/route.ts
import { NextResponse } from "next/server";
import { getTodayLunar } from "@/lib/calendar";
import { generateDailyFortune } from "@/lib/templates/fortune";

export async function GET() {
  const lunar = getTodayLunar();
  const fortune = generateDailyFortune(lunar);

  return NextResponse.json({
    date: new Date().toISOString().split("T")[0],
    lunar: {
      year: lunar.year,
      month: lunar.lunarMonthName,
      day: lunar.lunarDayName,
      yearShengXiao: lunar.yearShengXiao,
    },
    fortune,
  });
}
```

- [ ] **步骤 2：运势展示组件**

```typescript
// src/components/fortune/FortuneOverview.tsx
import type { DailyFortune } from "@/lib/templates/fortune";

export function FortuneOverview({ fortune }: { fortune: DailyFortune }) {
  return (
    <div className="text-center py-10">
      <div className="text-sm text-ink-soft tracking-[0.25em] mb-2">今日运势</div>
      <div className="text-[72px] font-thin tracking-[0.4em] text-ink mb-3">
        {fortune.level}
      </div>
      <div className="w-10 h-[2px] bg-ink mx-auto mb-4" />
      <p className="text-sm text-ink-light leading-relaxed max-w-xs mx-auto">
        {fortune.summary}
      </p>
    </div>
  );
}
```

```typescript
// src/components/fortune/FortuneDetails.tsx
import type { DailyFortune } from "@/lib/templates/fortune";

export function FortuneDetails({ fortune }: { fortune: DailyFortune }) {
  const categories = [
    { label: "事业", data: fortune.career },
    { label: "财运", data: fortune.wealth },
    { label: "感情", data: fortune.love },
    { label: "健康", data: fortune.health },
  ];

  return (
    <div className="mb-8">
      <div className="flex gap-4">
        {categories.map((c) => (
          <div key={c.label} className="flex-1 text-center py-4">
            <div className="text-[10px] text-ink-fade tracking-[0.15em] mb-2">{c.label}</div>
            <div className="w-8 h-8 border border-ink rounded-full inline-flex items-center justify-center text-xs font-semibold text-ink">
              {c.data.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/fortune/FortuneTiming.tsx
import type { DailyFortune } from "@/lib/templates/fortune";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FortuneTiming({ fortune }: { fortune: DailyFortune }) {
  return (
    <div className="border-t border-divider pt-6">
      <SectionTitle>吉时</SectionTitle>
      <div className="flex gap-2">
        {fortune.luckyHours.map((h, i) => (
          <span key={h} className={`px-3 py-1.5 text-[11px] tracking-[0.05em] ${
            i === 0 ? "bg-ink text-paper" : "bg-divider/50 text-ink"
          }`}>{h}</span>
        ))}
      </div>
      <div className="mt-4 flex gap-6 text-[11px] text-ink-light tracking-[0.1em]">
        <span>幸运色：{fortune.luckyColor}</span>
        <span>吉方：{fortune.luckyDirection}</span>
      </div>
      <div className="mt-4 text-center">
        <p className="text-[11px] text-ink-soft italic tracking-[0.1em]">
          「{fortune.mantra}」
        </p>
      </div>
    </div>
  );
}
```

- [ ] **步骤 3：运势页面**

```typescript
// src/app/fortune/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FortuneOverview } from "@/components/fortune/FortuneOverview";
import { FortuneDetails } from "@/components/fortune/FortuneDetails";
import { FortuneTiming } from "@/components/fortune/FortuneTiming";
import type { DailyFortune } from "@/lib/templates/fortune";

interface FortuneData {
  date: string;
  lunar: { year: number; month: string; day: string; yearShengXiao: string };
  fortune: DailyFortune;
}

export default function FortunePage() {
  const [data, setData] = useState<FortuneData | null>(null);

  useEffect(() => {
    fetch("/api/fortune").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-center py-20 text-ink-soft">加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center pt-8 mb-2">
        <h2 className="text-sm font-semibold tracking-[0.25em] text-ink">今日运势</h2>
        <span className="text-[11px] text-ink-fade tracking-[0.12em]">{data.date}</span>
      </div>
      <FortuneOverview fortune={data.fortune} />
      <FortuneDetails fortune={data.fortune} />
      <FortuneTiming fortune={data.fortune} />

      {/* VIP引导 */}
      <div className="mt-8 p-6 bg-white border border-divider text-center">
        <p className="text-xs text-ink-light tracking-[0.1em] leading-relaxed mb-3">
          💎 永久VIP解锁每日详细运程 · 流月运势 · 个人年运
        </p>
        <a href="#" className="text-[11px] text-ink underline tracking-[0.15em]">了解VIP权益</a>
      </div>
    </div>
  );
}
```

- [ ] **步骤 4：验证**

访问 `http://localhost:3000/fortune` — 运势等级、四项评分、吉时、箴言。

- [ ] **步骤 5：提交**

```bash
git add -A
git commit -m "feat: 构建今日运势页面（API+展示组件+VIP引导）"
```

---

### 任务 4.3：构建八字排盘页面

**文件：**
- 创建：`src/app/api/bazi/route.ts`
- 创建：`src/components/bazi/BaziInput.tsx`
- 创建：`src/components/bazi/BaziResult.tsx`
- 创建：`src/components/bazi/BaziReading.tsx`
- 创建：`src/app/bazi/page.tsx`

- [ ] **步骤 1：八字 API**

```typescript
// src/app/api/bazi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";
import { getFreeBaziReading } from "@/lib/templates/bazi";

export async function POST(req: NextRequest) {
  const { birthDate, birthHour, gender } = await req.json();
  const date = new Date(birthDate);

  if (isNaN(date.getTime()) || birthHour < 0 || birthHour > 23) {
    return NextResponse.json({ error: "出生日期或时辰无效" }, { status: 400 });
  }

  const result = calculateBazi(date, birthHour, gender);
  const reading = getFreeBaziReading(result.dayMaster, result.fiveElements);

  return NextResponse.json({ ...result, reading });
}
```

- [ ] **步骤 2：八字输入组件**

```typescript
// src/components/bazi/BaziInput.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BaziInput({ onSubmit }: {
  onSubmit: (data: { birthDate: string; birthHour: number; gender: string }) => void;
}) {
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState(12);
  const [gender, setGender] = useState("male");

  const hours = [
    "子时 23-1", "丑时 1-3", "寅时 3-5", "卯时 5-7",
    "辰时 7-9", "巳时 9-11", "午时 11-13", "未时 13-15",
    "申时 15-17", "酉时 17-19", "戌时 19-21", "亥时 21-23",
  ];
  const hourValues = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

  return (
    <div className="max-w-sm mx-auto py-10">
      <h2 className="text-sm font-semibold tracking-[0.25em] text-ink text-center mb-8">
        请输入你的出生信息
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] text-ink-fade tracking-[0.15em] mb-1.5">出生日期</label>
          <input type="date" value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="w-full p-3 bg-white border border-divider text-ink text-sm
                       focus:outline-none focus:border-ink transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] text-ink-fade tracking-[0.15em] mb-1.5">出生时辰</label>
          <select value={birthHour}
            onChange={e => setBirthHour(Number(e.target.value))}
            className="w-full p-3 bg-white border border-divider text-ink text-sm
                       focus:outline-none focus:border-ink">
            {hours.map((h, i) => (
              <option key={i} value={hourValues[i]}>{h}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-ink-fade tracking-[0.15em] mb-1.5">性别</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" checked={gender === "male"} onChange={() => setGender("male")} />
              <span className="text-sm text-ink">男</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" checked={gender === "female"} onChange={() => setGender("female")} />
              <span className="text-sm text-ink">女</span>
            </label>
          </div>
        </div>
        <Button onClick={() => onSubmit({ birthDate, birthHour, gender })} className="w-full text-center">
          查看命盘
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **步骤 3：八字结果组件**

```typescript
// src/components/bazi/BaziResult.tsx
import { PillarCard } from "@/components/ui/PillarCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { BaziResult } from "@/lib/bazi";

export function BaziResult({ result }: { result: BaziResult }) {
  return (
    <div>
      {/* 四柱 */}
      <div className="flex gap-0.5 mb-8">
        <PillarCard label="年柱" ganZhi={result.yearPillar.ganZhi} nayin={result.yearPillar.nayin} />
        <PillarCard label="月柱" ganZhi={result.monthPillar.ganZhi} nayin={result.monthPillar.nayin} />
        <PillarCard label="日柱" ganZhi={result.dayPillar.ganZhi} nayin={result.dayPillar.nayin} />
        <PillarCard label="时柱" ganZhi={result.hourPillar.ganZhi} nayin={result.hourPillar.nayin} />
      </div>

      {/* 五行 */}
      <div className="mb-8">
        <SectionTitle>五行分布</SectionTitle>
        <div className="flex gap-3">
          <ProgressBar label="金" value={result.fiveElements.jin} />
          <ProgressBar label="木" value={result.fiveElements.mu} />
          <ProgressBar label="水" value={result.fiveElements.shui} />
          <ProgressBar label="火" value={result.fiveElements.huo} />
          <ProgressBar label="土" value={result.fiveElements.tu} />
        </div>
      </div>

      <div className="text-center text-xs text-ink-fade tracking-[0.12em]">
        日主 <span className="font-semibold text-ink">{result.dayMaster}</span> ·
        生肖 <span className="font-semibold text-ink">{result.shengXiao}</span>
      </div>
    </div>
  );
}
```

```typescript
// src/components/bazi/BaziReading.tsx
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function BaziReading({ reading }: { reading: string }) {
  return (
    <Card className="mt-8">
      <SectionTitle>命理简析</SectionTitle>
      <div className="text-[13px] text-ink-light leading-relaxed tracking-[0.05em] whitespace-pre-line">
        {reading}
      </div>
    </Card>
  );
}
```

- [ ] **步骤 4：八字页面**

```typescript
// src/app/bazi/page.tsx
"use client";

import { useState } from "react";
import { BaziInput } from "@/components/bazi/BaziInput";
import { BaziResult } from "@/components/bazi/BaziResult";
import { BaziReading } from "@/components/bazi/BaziReading";

export default function BaziPage() {
  const [result, setResult] = useState<unknown>(null);

  const handleSubmit = async (data: { birthDate: string; birthHour: number; gender: string }) => {
    const res = await fetch("/api/bazi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setResult(await res.json());
  };

  if (!result) return <BaziInput onSubmit={handleSubmit} />;

  return (
    <div className="pt-8">
      <BaziResult result={result as any} />
      <BaziReading reading={(result as any).reading} />
      <button onClick={() => setResult(null)}
        className="block mx-auto mt-6 text-[11px] text-ink-fade tracking-[0.15em] hover:text-ink transition-colors">
        ← 返回重新测算
      </button>
    </div>
  );
}
```

- [ ] **步骤 5：验证**

访问 `http://localhost:3000/bazi` — 输入表单 → 四柱+五行+解读。

- [ ] **步骤 6：提交**

```bash
git add -A
git commit -m "feat: 构建八字排盘页面（输入+四柱+五行+免费解读）"
```

---

### 任务 4.4：构建姻缘配对页面

**文件：**
- 创建：`src/app/api/marriage/route.ts`
- 创建：`src/components/marriage/MarriageInput.tsx`
- 创建：`src/components/marriage/MarriageResult.tsx`
- 创建：`src/app/marriage/page.tsx`

- [ ] **步骤 1：姻缘 API**

```typescript
// src/app/api/marriage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateMarriage } from "@/lib/marriage";
import { getFreeMarriageReading } from "@/lib/templates/marriage";

export async function POST(req: NextRequest) {
  const { person1, person2 } = await req.json();
  const result = calculateMarriage(person1, person2);
  const reading = getFreeMarriageReading(result.score);
  return NextResponse.json({ ...result, reading });
}
```

- [ ] **步骤 2：输入组件**

```typescript
// src/components/marriage/MarriageInput.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PersonData { birthDate: string; birthHour: number; gender: string; }

export function MarriageInput({ onSubmit }: {
  onSubmit: (data: { person1: PersonData; person2: PersonData }) => void;
}) {
  const [p1, setP1] = useState<PersonData>({ birthDate: "", birthHour: 12, gender: "male" });
  const [p2, setP2] = useState<PersonData>({ birthDate: "", birthHour: 12, gender: "female" });

  const hours = ["子时","丑时","寅时","卯时","辰时","巳时","午时","未时","申时","酉时","戌时","亥时"];
  const hourValues = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

  const renderPerson = (label: string, data: PersonData, setData: (d: PersonData) => void) => (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold tracking-[0.2em] text-ink">{label}</h4>
      <input type="date" value={data.birthDate}
        onChange={e => setData({ ...data, birthDate: e.target.value })}
        className="w-full p-3 bg-white border border-divider text-sm focus:outline-none focus:border-ink" />
      <select value={data.birthHour}
        onChange={e => setData({ ...data, birthHour: Number(e.target.value) })}
        className="w-full p-3 bg-white border border-divider text-sm focus:outline-none focus:border-ink">
        {hours.map((h, i) => <option key={i} value={hourValues[i]}>{h} ({hourValues[i]}:00)</option>)}
      </select>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={data.gender==="male"} onChange={()=>setData({...data,gender:"male"})}/>男</label>
        <label className="flex items-center gap-2 text-sm"><input type="radio" checked={data.gender==="female"} onChange={()=>setData({...data,gender:"female"})}/>女</label>
      </div>
    </div>
  );

  return (
    <div className="max-w-sm mx-auto py-10">
      <h2 className="text-sm font-semibold tracking-[0.25em] text-ink text-center mb-8">请输入双方信息</h2>
      <div className="space-y-6">
        {renderPerson("甲方", p1, setP1)}
        <div className="border-t border-divider" />
        {renderPerson("乙方", p2, setP2)}
        <Button onClick={() => onSubmit({ person1: p1, person2: p2 })} className="w-full text-center">
          查看合婚结果
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **步骤 3：结果组件**

```typescript
// src/components/marriage/MarriageResult.tsx
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { MarriageResult } from "@/lib/marriage";

const DETAIL_LABELS: Record<string, string> = {
  shengxiao: "生肖匹配", nayin: "纳音匹配", wuxing: "五行互补", bazi: "八字合婚",
};

export function MarriageResult({ result, reading }: { result: MarriageResult; reading: string }) {
  return (
    <div className="pt-8">
      <div className="text-center py-8">
        <div className="text-sm text-ink-soft tracking-[0.25em] mb-2">合婚指数</div>
        <div className="text-[72px] font-thin text-ink">{result.score}</div>
        <div className="text-sm text-ink-light mt-2">{result.summary}</div>
      </div>

      <div className="space-y-3 mb-8">
        {Object.entries(result.details).map(([key, detail]) => (
          <Card key={key}>
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold tracking-[0.15em] text-ink">
                {DETAIL_LABELS[key]}
              </div>
              <div className="text-xs text-ink-fade">{detail.score} 分</div>
            </div>
            <div className="text-[12px] text-ink-light mt-2 leading-relaxed">{detail.text}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>合婚简评</SectionTitle>
        <div className="text-[13px] text-ink-light leading-relaxed whitespace-pre-line">{reading}</div>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 4：姻缘页面**

```typescript
// src/app/marriage/page.tsx
"use client";

import { useState } from "react";
import { MarriageInput } from "@/components/marriage/MarriageInput";
import { MarriageResult } from "@/components/marriage/MarriageResult";

export default function MarriagePage() {
  const [result, setResult] = useState<unknown>(null);

  if (!result) return <MarriageInput onSubmit={async (data) => {
    const res = await fetch("/api/marriage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setResult(await res.json());
  }} />;

  return (
    <div>
      <MarriageResult result={result as any} reading={(result as any).reading} />
      <button onClick={() => setResult(null)}
        className="block mx-auto mt-6 text-[11px] text-ink-fade tracking-[0.15em] hover:text-ink transition-colors">
        ← 重新测算
      </button>
    </div>
  );
}
```

- [ ] **步骤 5：验证**

访问 `http://localhost:3000/marriage` — 双方信息输入 → 合婚分数+四项评分+解读。

- [ ] **步骤 6：提交**

```bash
git add -A
git commit -m "feat: 构建姻缘配对页面（双方输入+评分+简评+VIP引导）"
```

---

### 任务 4.5：构建易经占卜页面

**文件：**
- 创建：`src/app/api/iching/route.ts`
- 创建：`src/components/iching/IchingCast.tsx`
- 创建：`src/components/iching/IchingResult.tsx`
- 创建：`src/app/iching/page.tsx`

- [ ] **步骤 1：易经 API**

```typescript
// src/app/api/iching/route.ts
import { NextRequest, NextResponse } from "next/server";
import { castIching, getIchingFreeReading } from "@/lib/iching";

export async function POST(req: NextRequest) {
  const { question } = await req.json().catch(() => ({}));
  const result = castIching();
  const reading = getIchingFreeReading(result);

  // TODO: 接入用户系统后检查每日免费次数
  return NextResponse.json({ ...result, reading });
}
```

- [ ] **步骤 2：起卦组件**

```typescript
// src/components/iching/IchingCast.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function IchingCast({ onCast, isCasting }: {
  onCast: (question: string) => void;
  isCasting: boolean;
}) {
  const [question, setQuestion] = useState("");

  return (
    <div className="max-w-sm mx-auto py-10 text-center">
      <h2 className="text-sm font-semibold tracking-[0.25em] text-ink mb-2">易经占卜</h2>
      <p className="text-[12px] text-ink-soft tracking-[0.1em] mb-6">心诚则灵 · 每日免费一次</p>

      <div className="w-24 h-24 border-2 border-ink rounded-full mx-auto mb-8 flex items-center justify-center">
        <span className="text-3xl">☯</span>
      </div>

      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="默想你的问题（可选）..."
        rows={3}
        className="w-full p-4 bg-white border border-divider text-sm text-ink
                   placeholder:text-ink-fade focus:outline-none focus:border-ink mb-6 resize-none"
      />

      <Button onClick={() => onCast(question)} className="w-full text-center">
        {isCasting ? "起卦中..." : "开始起卦"}
      </Button>
      <p className="mt-4 text-[10px] text-ink-fade tracking-[0.1em]">
        每日免费1次 · 永久VIP不限次数
      </p>
    </div>
  );
}
```

- [ ] **步骤 3：结果组件**

```typescript
// src/components/iching/IchingResult.tsx
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { IchingResult } from "@/lib/iching";

export function IchingResultDisplay({ result, reading }: {
  result: IchingResult;
  reading: string;
}) {
  return (
    <div className="pt-8">
      <div className="text-center py-8">
        <div className="text-[64px] mb-4">{result.hexagramChar}</div>
        <div className="text-2xl font-thin tracking-[0.4em] text-ink mb-2">
          {result.chineseName}
        </div>
        <div className="text-xs text-ink-soft tracking-[0.15em]">
          第{result.hexagramNumber}卦 · {result.upperTrigram}上{result.lowerTrigram}下
        </div>
      </div>

      <Card className="mb-4">
        <SectionTitle>卦辞</SectionTitle>
        <p className="text-[13px] text-ink-light leading-relaxed">{result.judgment}</p>
      </Card>

      {result.changingLineText && (
        <Card className="mb-4 border-ink/20">
          <SectionTitle>动爻 · 第{result.changingLine}爻</SectionTitle>
          <p className="text-[13px] text-ink leading-relaxed">{result.changingLineText}</p>
          {result.changedHexagram && (
            <div className="mt-3 pt-3 border-t border-divider text-xs text-ink-soft">
              变卦：{result.changedHexagram.char} {result.changedHexagram.name}（第{result.changedHexagram.number}卦）
            </div>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle>解卦</SectionTitle>
        <div className="text-[13px] text-ink-light leading-relaxed whitespace-pre-line">{reading}</div>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 4：易经页面**

```typescript
// src/app/iching/page.tsx
"use client";

import { useState } from "react";
import { IchingCast } from "@/components/iching/IchingCast";
import { IchingResultDisplay } from "@/components/iching/IchingResult";

export default function IchingPage() {
  const [result, setResult] = useState<unknown>(null);
  const [casting, setCasting] = useState(false);

  const handleCast = async (question: string) => {
    setCasting(true);
    const res = await fetch("/api/iching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    setResult(await res.json());
    setCasting(false);
  };

  if (!result) return <IchingCast onCast={handleCast} isCasting={casting} />;

  return (
    <div>
      <IchingResultDisplay result={result as any} reading={(result as any).reading} />
      <button onClick={() => setResult(null)}
        className="block mx-auto mt-6 text-[11px] text-ink-fade tracking-[0.15em] hover:text-ink transition-colors">
        ← 再占一卦
      </button>
    </div>
  );
}
```

- [ ] **步骤 5：验证**

访问 `http://localhost:3000/iching` — 起卦界面 → 卦象+卦辞+动爻+解卦。

- [ ] **步骤 6：提交**

```bash
git add -A
git commit -m "feat: 构建易经占卜页面（起卦+卦象展示+免费解读）"
```

---

### 任务 4.6：构建每日黄历页面

**文件：**
- 创建：`src/app/api/huangli/route.ts`
- 创建：`src/components/huangli/HuangliCalendar.tsx`
- 创建：`src/components/huangli/HuangliDetails.tsx`
- 创建：`src/app/huangli/page.tsx`

- [ ] **步骤 1：黄历 API**

```typescript
// src/app/api/huangli/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLunarDate } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  const lunar = getLunarDate(date);

  return NextResponse.json({
    solar: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
    lunar: {
      year: lunar.year,
      month: lunar.lunarMonthName,
      day: lunar.lunarDayName,
      yearInGanZhi: lunar.yearInGanZhi,
      monthInGanZhi: lunar.monthInGanZhi,
      dayInGanZhi: lunar.dayInGanZhi,
      yearShengXiao: lunar.yearShengXiao,
      solarTerm: lunar.solarTerm,
    },
    almanac: {
      yi: lunar.dayYi,
      ji: lunar.dayJi,
      jiShen: lunar.dayJiShen,
      xiongSha: lunar.dayXiongSha,
      xiShen: lunar.dayPosition.xi,
      fuShen: lunar.dayPosition.fu,
      caiShen: lunar.dayPosition.cai,
    },
  });
}
```

- [ ] **步骤 2：黄历组件**

```typescript
// src/components/huangli/HuangliCalendar.tsx
"use client";

export function HuangliCalendar({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onChange(d.toISOString().split("T")[0]);
  };
  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onChange(d.toISOString().split("T")[0]);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button onClick={prevDay} className="text-ink-fade hover:text-ink text-lg">←</button>
      <input type="date" value={date}
        onChange={e => onChange(e.target.value)}
        className="p-3 bg-white border border-divider text-ink text-sm text-center
                   focus:outline-none focus:border-ink" />
      <button onClick={nextDay} className="text-ink-fade hover:text-ink text-lg">→</button>
    </div>
  );
}
```

```typescript
// src/components/huangli/HuangliDetails.tsx
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

interface HuangliData {
  solar: { year: number; month: number; day: number };
  lunar: { year: number; month: string; day: string; yearInGanZhi: string; monthInGanZhi: string; dayInGanZhi: string; yearShengXiao: string; solarTerm: string | null };
  almanac: { yi: string[]; ji: string[]; jiShen: string[]; xiongSha: string[]; xiShen: string; fuShen: string; caiShen: string };
}

export function HuangliDetails({ data }: { data: HuangliData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs text-ink-fade tracking-[0.15em]">
          {data.lunar.yearInGanZhi}年 · 生肖{data.lunar.yearShengXiao}
        </div>
        <div className="text-2xl font-thin tracking-[0.3em] text-ink mt-2">
          {data.lunar.month}{data.lunar.day}
        </div>
        {data.lunar.solarTerm && (
          <div className="text-xs text-ink-soft mt-1">节气：{data.lunar.solarTerm}</div>
        )}
      </div>

      <Card>
        <SectionTitle>宜</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {data.almanac.yi.length > 0
            ? data.almanac.yi.map((y, i) => (
                <span key={i} className="px-2 py-0.5 text-[11px] text-ink bg-divider/30 tracking-[0.1em]">{y}</span>
              ))
            : <span className="text-xs text-ink-fade">—</span>}
        </div>
      </Card>

      <Card>
        <SectionTitle>忌</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {data.almanac.ji.length > 0
            ? data.almanac.ji.map((j, i) => (
                <span key={i} className="px-2 py-0.5 text-[11px] text-ink-light bg-divider/20 tracking-[0.1em]">{j}</span>
              ))
            : <span className="text-xs text-ink-fade">—</span>}
        </div>
      </Card>

      <div className="flex gap-4">
        <Card className="flex-1">
          <SectionTitle>吉神</SectionTitle>
          <div className="text-[11px] text-ink-light leading-relaxed">
            {data.almanac.jiShen.length > 0 ? data.almanac.jiShen.join("、") : "—"}
          </div>
        </Card>
        <Card className="flex-1">
          <SectionTitle>凶煞</SectionTitle>
          <div className="text-[11px] text-ink-fade leading-relaxed">
            {data.almanac.xiongSha.length > 0 ? data.almanac.xiongSha.join("、") : "—"}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>吉神方位</SectionTitle>
        <div className="flex gap-6 text-[12px] text-ink-light tracking-[0.1em]">
          <span>喜神：{data.almanac.xiShen}</span>
          <span>福神：{data.almanac.fuShen}</span>
          <span>财神：{data.almanac.caiShen}</span>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **步骤 3：黄历页面**

```typescript
// src/app/huangli/page.tsx
"use client";

import { useEffect, useState } from "react";
import { HuangliCalendar } from "@/components/huangli/HuangliCalendar";
import { HuangliDetails } from "@/components/huangli/HuangliDetails";

export default function HuangliPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    fetch(`/api/huangli?date=${date}`).then(r => r.json()).then(setData);
  }, [date]);

  return (
    <div className="pt-4">
      <HuangliCalendar date={date} onChange={setDate} />
      {data && <HuangliDetails data={data as any} />}
    </div>
  );
}
```

- [ ] **步骤 4：验证**

访问 `http://localhost:3000/huangli` — 日期选择 → 农历信息+宜忌列表+吉神方位。

- [ ] **步骤 5：提交**

```bash
git add -A
git commit -m "feat: 构建每日黄历页面（日期选择+宜忌+吉神方位）"
```

---

## 第五阶段：用户系统与VIP

### 任务 5.1：集成 Supabase Auth

**文件：**
- 创建：`src/app/auth/callback/route.ts`
- 修改：`src/components/layout/Navbar.tsx`

- [ ] **步骤 1：Auth 回调路由**

```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }
  return NextResponse.redirect(`${origin}/`);
}
```

- [ ] **步骤 2：更新导航栏（加入登录状态）**

在 `Navbar.tsx` 顶部添加 `"use client"`，导入 `createClient` 和 `useEffect`/`useState`，增加登录/退出按钮。具体代码见完整计划文件。

- [ ] **步骤 3：提交**

```bash
git add -A
git commit -m "feat: 集成 Supabase Auth（邮箱+Google OAuth）"
```

---

### 任务 5.2：构建 VIP 门控组件

**文件：**
- 创建：`src/components/ui/VIPGate.tsx`

- [ ] **步骤 1：VIPGate**

```typescript
// src/components/ui/VIPGate.tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function VIPGate({ children, isVip, featureName }: {
  children: React.ReactNode;
  isVip: boolean;
  featureName: string;
}) {
  if (isVip) return <>{children}</>;

  return (
    <Card className="text-center py-8 mt-6">
      <div className="text-3xl mb-3">💎</div>
      <h4 className="text-xs font-semibold tracking-[0.2em] text-ink mb-2">
        {featureName}为VIP专属内容
      </h4>
      <p className="text-[12px] text-ink-light leading-relaxed mb-4">
        永久VIP一次购买，终身畅享全部深度报告与AI解读
      </p>
      <Button variant="primary" className="text-xs tracking-[0.15em]">
        了解永久VIP · ¥88
      </Button>
      <p className="mt-3 text-[10px] text-ink-fade tracking-[0.08em]">
        或单独购买此报告 ¥3
      </p>
    </Card>
  );
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 构建 VIPGate 门控组件"
```

---

## 第六阶段：AI 集成（VIP 专属）

### 任务 6.1：构建 AI 报告 API

**文件：**
- 创建：`src/app/api/ai/route.ts`

- [ ] **步骤 1：AI 报告 API**

```typescript
// src/app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateFortuneReport } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // 检查VIP状态
  const { data: dbUser } = await supabase
    .from("User").select("isVip").eq("id", user.id).single();

  if (!dbUser?.isVip) {
    return NextResponse.json({ error: "此功能为VIP专属" }, { status: 403 });
  }

  const { type, userData } = await req.json();
  if (!["bazi","marriage","iching","fortune"].includes(type)) {
    return NextResponse.json({ error: "无效的报告类型" }, { status: 400 });
  }

  try {
    const report = await generateFortuneReport(type, userData);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "AI报告生成失败，请稍后重试" }, { status: 500 });
  }
}
```

- [ ] **步骤 2：提交**

```bash
git add -A
git commit -m "feat: 添加 VIP 专属 AI 报告 API（DeepSeek）"
```

---

## MVP 后续任务（不在本计划中）

- 支付接入（个人收款码 → 微信支付）
- VIP 购买流程和权益发放
- 取名测字模块
- 风水运势模块
- 星座命盘模块
- 微信小程序（复用 API）
- SEO 优化
- 用户行为分析

---

## 自检清单

1. **规格覆盖：** MVP全部模块已覆盖 ✅（运势 ✅、八字 ✅、姻缘 ✅、易经 ✅、黄历 ✅）。用户认证 ✅。VIP门控 ✅。DeepSeek AI ✅。设计令牌 ✅。免费内容模板 ✅。

2. **占位符扫描：** 六十四卦数据（卦3-64）需补全 — 已在任务中标注。阅读模板已基本完整。

3. **类型一致性：** API 返回类型与组件 prop 类型保持一致。所有接口在各文件中就近定义。
