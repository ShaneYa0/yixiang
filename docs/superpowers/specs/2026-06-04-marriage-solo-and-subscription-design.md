# 姻缘模块重构 & 订阅体系设计

日期：2026-06-04

## 概述

两大改动：

1. **姻缘模块新增单人姻缘**：双人合婚 + 单人姻缘在同一页面通过 tab 切换
2. **订阅体系替换单次购买**：去掉"免费次数"模式，改为注册送 1 天试用 + 多档订阅

---

## 一、订阅体系

### 1.1 订阅档位

| 档位 | 价格 | 时长 |
|------|------|------|
| 新注册试用 | 免费 | 1 天 |
| 周订阅 | ¥8.8 | 7 天 |
| 月订阅 | ¥18.8 | 30 天 |
| 半年订阅 | ¥88 | 180 天 |
| 年订阅 | ¥138 | 365 天 |

### 1.2 账户模型

去掉 `reportCredits`（免费次数），改为：

```
用户账户
├── trialEndsAt        → 注册时自动设置为 now + 1天
├── subscriptionTier   → null | "weekly" | "monthly" | "semiAnnual" | "annual"
├── subscriptionEndsAt → 订阅到期时间
└── isVip             → 计算字段（不存库）：trialEndsAt > now 或 subscriptionEndsAt > now
```

注册时：`POST /api/auth/local-login` 或注册回调中自动设置 `trialEndsAt = new Date(Date.now() + 86400000)`

### 1.3 试用/订阅流程

```
注册 → 自动获得 1 天试用
         │
         ├── 试用期内：isVip = true，全部功能可用
         │
         └── 试用到期后：
                isVip = false
                需选择订阅档位才能解锁深度内容
```

### 1.4 对八字详批的改动

- 现有 `BaziDeepReportOffer` 去掉"首份免费 / ¥8.8 单次"模式
- `isVip` 用户：直接可查看深度详批
- 非 VIP 用户：展示订阅引导卡片

---

## 二、模块内容分层

### 2.1 八字详批

| 内容 | 免费 | 订阅 |
|------|:---:|:---:|
| 基础排盘（四柱/五行/纳音/十神） | ✅ | ✅ |
| 深度详批（格局/用神/十神组合/事业财运/感情婚姻/健康/大运流年） | | ✅ |
| 专属报告保存回看 | | ✅ |

### 2.2 双人合婚

| 内容 | 免费 | 订阅 |
|------|:---:|:---:|
| 日柱分析（天干五合/地支六合冲害） | ✅ | ✅ |
| 五行互补（双方五行生克） | ✅ | ✅ |
| 纳音气质匹配 | ✅ | ✅ |
| 生肖匹配（三合/六冲） | ✅ | ✅ |
| 综合评分 + 总结 | ✅ | ✅ |
| 大运同步度（双方当前大运阶段对比） | | ✅ |
| 财官互动（男方财星 vs 女方官星在对方盘中体现）| | ✅ |
| 相处建议（沟通节奏/边界感/长期经营） | | ✅ |
| 视觉特效（金色渐变评分/微光边框） | | ✅ |
| 专属报告保存回看 | | ✅ |

### 2.3 单人姻缘

| 内容 | 免费 | 订阅 |
|------|:---:|:---:|
| 婚姻宫分析（日支五行/强弱/冲合害） | ✅ | ✅ |
| 配偶星分析（官/财星有无/强弱/位置） | ✅ | ✅ |
| 桃花运分析（桃花星位置/感情特点） | ✅ | ✅ |
| 综合评分 + 总结 | ✅ | ✅ |
| 正缘时机（大运流年婚缘时间窗口） | | ✅ |
| 配偶画像（伴侣五行/性格轮廓/相处建议）| | ✅ |
| 视觉特效（金色渐变评分/微光边框） | | ✅ |
| 专属报告保存回看 | | ✅ |

---

## 三、姻缘页面 UI

### 3.1 Tab 切换

- 页面顶部 tab 栏：「双人合婚」|「单人姻缘」
- 默认选中"双人合婚"
- 选中 tab：底部横线 + 略大字重 + 菱形装饰（◈）
- 未选中 tab：灰色文字 + 空心菱形（◇）
- 切换时清空已有结果，结果区淡入动画

### 3.2 单人姻缘输入

- 标题：姻缘分析
- 字段：姓名（文本）、性别（男/女切换按钮）、出生日期（date input）、出生时辰（0-23 时）
- 底部：开始测算按钮

### 3.3 结果展示（通用）

- 评分居中大数字 + 等级文字（如"良缘可期"/"天作之合"）
- 订阅用户：评分数字金色渐变动画、卡片微光金色边框
- 维度卡片 2x2 或 2x3 网格排列
- 底部订阅锁区：显示 🔒 标记 + "查看订阅方案"按钮
- 订阅用户：锁区变为正常内容卡片，顶部有小 VIP 标记
- 报告操作栏（订阅用户）：保存报告、分享

### 3.4 双人合婚增强

现有维度从 4 个变为 6 个（免费 4 + 付费 2）：
- 日柱匹配、五行互补、纳音气质、生肖匹配（免费）
- 大运同步、财官互动（订阅）
- 合婚简评统一展示

---

## 四、后端逻辑

### 4.1 新增：单人姻缘计算 `calculateSingleMarriage()`

文件：`src/lib/marriage.ts`

输入：
```ts
type SingleMarriageInput = {
  name: string;
  birthDate: string;
  birthHour: number;
  gender: "male" | "female";
};
```

分析维度：

1. **婚姻宫（日支）** — 权重 30%
   - 日支是否被年/月/时支冲（六冲）→ 扣分
   - 日支是否被年/月/时支害（六害）→ 扣分
   - 日支是否与年/月/时支合（六合）→ 加分
   - 日支藏干中是否有配偶星 → 加分

2. **配偶星（十神）** — 权重 30%
   - 男命：统计正财/偏财在四柱天干、地支藏干中的出现次数
   - 女命：统计正官/七杀在四柱天干、地支藏干中的出现次数
   - 配偶星透干 > 藏支 > 缺失
   - 配偶星是否落在日支（配偶宫）→ 大加分

3. **桃花运** — 权重 25%
   - 根据年支/日支查桃花位（申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午）
   - 桃花是否在四柱中出现
   - 桃花是否与配偶星同柱 → 加分
   - 桃花是否被冲害 → 扣分

4. **综合评分** — 权重 15%
   - 日主强弱与配偶星的平衡
   - 五行缺项是否影响感情表达
   - 大运当前阶段是否有利感情

输出：
```ts
type SingleMarriageResult = {
  score: number;
  summary: string;
  details: {
    marriagePalace: { score: number; text: string };
    spouseStar: { score: number; text: string };
    romanceLuck: { score: number; text: string };
  };
  // 订阅额外
  timing?: { text: string; bestYears: number[] };    // 正缘时机
  spousePortrait?: { text: string; element: string }; // 配偶画像
  person: { name: string; dominantElement: string };
};
```

### 4.2 增强：双人合婚 `calculateMarriage()`

新增订阅维度：
- **大运同步度**：比较双方当前大运元素关系，生成同步评分和文字
- **财官互动**：男方财星与女方官星在对方盘中的体现，分析吸引力模式

### 4.3 API 路由

#### `POST /api/marriage`（扩展现有）

```ts
// 请求体
{
  mode: "pair" | "solo",
  personA?: PersonInput,
  personB?: PersonInput,  // mode=pair 时必填
  solo?: SingleMarriageInput  // mode=solo 时必填
}

// 响应
{
  mode: "pair" | "solo",
  result: MarriageResult | SingleMarriageResult
}
```

#### `GET /api/me`（扩展）

新增返回字段：
```ts
{
  user: {
    id: string;
    email: string;
    isVip: boolean;
    trialEndsAt: string | null;
    subscriptionTier: "weekly" | "monthly" | "semiAnnual" | "annual" | null;
    subscriptionEndsAt: string | null;
  }
}
```

#### `POST /api/subscription`（新增）

> 暂做状态直设（无真实支付），后续接入支付时在此层加验证。

```ts
// 请求体
{ tier: "weekly" | "monthly" | "semiAnnual" | "annual" }

// 行为：直接设置 subscriptionTier + subscriptionEndsAt
// 响应
{ success: true; subscriptionTier: string; subscriptionEndsAt: string }
```

---

## 五、数据库（Prisma）

在现有 User 模型上调整：

```prisma
model User {
  // ... 现有字段
  reportCredits      Int        @default(0)   // 废弃，保留迁移兼容
  trialEndsAt        DateTime?                 // 新增
  subscriptionTier   String?                   // 新增：weekly/monthly/semiAnnual/annual
  subscriptionEndsAt DateTime?                 // 新增
}
```

---

## 六、实现顺序

1. **Prisma 模型更新** — 新增订阅字段
2. **订阅逻辑** — `/api/me` 扩展、`/api/subscription` 新增
3. **单人姻缘计算** — `calculateSingleMarriage()`
4. **双人合婚增强** — 新增大运同步 + 财官互动维度
5. **姻缘页面 UI** — tab 切换 + 单人输入 + 结果展示
6. **VIPGate 改造** — 基于新订阅模型
7. **八字详批改造** — 去掉免费次数，改用订阅判断
8. **订阅引导页** — 订阅过期后的引导界面

---

## 七、不做的范围

- AI 深度解读（用户明确说先不做）
- 真实支付集成（先做状态管理，支付后续接）
- 黄历、运势、易经模块暂无改动
