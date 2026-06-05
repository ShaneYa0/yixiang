# 姻缘模块重设计：去评分、去VIP花哨、对齐八字风格

日期：2026-06-05
状态：设计中

## 概述

当前姻缘模块存在三个核心问题：

1. **内容太薄**：免费解读只有3行文本，缺少多维度专业分析
2. **VIP花里胡哨**：金色光效、闪烁动画、锁图标、VIP徽章遍布结果页
3. **评分让人不适**：用数字给姻缘打分，用户感受不好

改造目标：**对齐八字模块的简洁专业风格** — 去掉所有评分和VIP特效，把所有分析维度免费展示，底部一个干净的深度详批CTA。

---

## 一、核心改动原则

### 1.1 去掉评分，改用"缘型"标签

不再有 0-100 的数字分数。每个模式有一个综合定性标签：

**双人合婚（4个缘型）：**

| 缘型标签 | 触发条件 | 含义 |
|----------|---------|------|
| 天赐良缘 | 日柱天合 + 五行相生 + 三合生肖 | 各方面高度契合 |
| 互补良缘 | 五行相生 + 一项以上和谐 | 互相成就 |
| 契合之缘 | 多数维度中性偏吉 | 适合共同经营 |
| 成长之缘 | 存在冲害或五行制衡 | 需磨合但有可能性 |

**单人姻缘（4个缘型）：**

| 缘型标签 | 触发条件 | 含义 |
|----------|---------|------|
| 正缘明朗 | 配偶星透干 + 婚姻宫稳固 + 桃花得位 | 姻缘清晰可见 |
| 佳期可期 | 配偶星有显现 + 婚姻宫尚稳 | 时机成熟可出现 |
| 缘待时机 | 配偶星藏支或偏弱 | 需耐心等待引动 |
| 水到渠成 | 配偶星不显但无冲害 | 顺其自然发展 |

每个维度的分析文字末尾附传统术语说明（如"此即天干五合之理"），但不打分数。

### 1.2 去掉VIP分级展示

- 结果页不传 `isVip`、不渲染 `SubscriptionGuide`
- 所有分析维度直接展示，无锁区、无VIP徽章、无金色特效
- 底部放置一个 `MarriageDeepReportOffer` 组件（风格对齐 `BaziDeepReportOffer`）
- 页面状态三态：输入 → 结果+解读 → 重新测算

### 1.3 扩充免费解读内容

模板不写死3句话，按维度生成结构化的专业内容，像八字解读一样包含术语和完整分析。

---

## 二、前端改造

### 2.1 MarriagePage（`src/app/marriage/page.tsx`）

改造后与 `BaziPage` 结构一致：

```tsx
"use client";

import { useState } from "react";
import { MarriageInput } from "@/components/marriage/MarriageInput";
import { MarriageResult } from "@/components/marriage/MarriageResult";
import { MarriageDeepReportOffer } from "@/components/marriage/MarriageDeepReportOffer";
import type { MarriageApiResponse } from "...";

export default function MarriagePage() {
  const [result, setResult] = useState<MarriageApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MarriageFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: MarriageFormData) => {
    setLoading(true);
    setLastInput(data);
    const response = await fetch("/api/marriage", { ... });
    setResult(await response.json());
    setLoading(false);
  };

  if (!result) return <MarriageInput onSubmit={submit} loading={loading} />;

  return (
    <div className="space-y-5">
      <MarriageResult mode={result.mode} result={result.result} />
      <MarriageReading reading={result.reading} />
      {lastInput && <MarriageDeepReportOffer result={result.result} input={lastInput} />}
      <button onClick={() => setResult(null)}>重新测算</button>
    </div>
  );
}
```

去掉的内容：
- `useState(user/setUser)` — 不再 fetch `/api/me`
- `useState(showSubscribe/setShowSubscribe)` — 不再弹订阅页
- `SubscriptionGuide` 条件渲染 — 整个过程无订阅中断
- `isVip` 计算和传递

### 2.2 MarriageInput

保持不变，Tab 切换和表单逻辑无需改动。

### 2.3 MarriageResult（重写）

不再接收 `isVip` 和 `onSubscribe`。纯展示组件。

**双人合婚展示结构：**

```
┌─ 总览 Card ───────────────────────────────────┐
│  合婚：天赐良缘                                │
│  [双方姓名 + 日主 + 生肖 + 主导五行]           │
│  综合概述文本（3-4句专业描述）                 │
└────────────────────────────────────────────────┘

┌─ 四柱对比 Card ───────────────────────────────┐
│  左右并排展示两人四柱（复用 PillarCard）       │
└────────────────────────────────────────────────┘

┌─ 日柱匹配 Card ───┐ ┌─ 五行互补 Card ────────┐
│  天干五合/地支关系  │ │  主导五行生克分析      │
└────────────────────┘ └────────────────────────┘

┌─ 纳音气质 Card ───┐ ┌─ 生肖匹配 Card ────────┐
│  纳音相合分析      │ │  三合六冲详细解读       │
└────────────────────┘ └────────────────────────┘

┌─ 大运同步 Card ───┐ ┌─ 财官互动 Card ────────┐
│  双方当前大运对比  │ │  配偶星交叉分析         │
└────────────────────┘ └────────────────────────┘
```

所有卡片无金色边框、无VIP标签、无分数显示、无锁图标。

**单人姻缘展示结构：**

```
┌─ 总览 Card ───────────────────────────────────┐
│  姻缘：正缘明朗                                │
│  [姓名 + 日主 + 生肖 + 主导五行]               │
│  综合概述文本（3-4句专业描述）                 │
└────────────────────────────────────────────────┘

┌─ 婚姻宫 Card ─────┐ ┌─ 配偶星 Card ──────────┐
│  日支合冲害分析    │ │  十神透干藏支分析       │
└────────────────────┘ └────────────────────────┘

┌─ 桃花运 Card ─────┐ ┌─ 正缘时机 Card ────────┐
│  桃花星位置与引动  │ │  最佳年份 + 大运分析    │
└────────────────────┘ └────────────────────────┘

┌─ 配偶画像 Card ───────────────────────────────┐
│  五行属性 + 性格轮廓 + 相处建议                │
└────────────────────────────────────────────────┘
```

### 2.4 MarriageReading（新增，对齐 BaziReading）

```tsx
export function MarriageReading({ reading }: { reading: string }) {
  return (
    <Card>
      <SectionTitle>合婚解读</SectionTitle>
      <div className="whitespace-pre-line text-[13px] leading-7 text-ink-light">{reading}</div>
    </Card>
  );
}
```

### 2.5 MarriageDeepReportOffer（新增，对齐 BaziDeepReportOffer）

结构跟 `BaziDeepReportOffer` 一致：左边文案 + 右边CTA卡片 + 底部内容模块列表 + deliverables。只是文案换成姻缘相关（"合婚深度详批"/"姻缘深度详批"）。

---

## 三、后端改造

### 3.1 `src/lib/marriage.ts`

**类型层改造：**

```ts
// 删除 MarriageResult.score 和 SingleMarriageResult.score
// 改为 yuanType（缘型标签）

type MarriageResult = {
  yuanType: string;        // "天赐良缘" | "互补良缘" | "契合之缘" | "成长之缘"
  summary: string;         // 综合概述
  details: Record<string, { text: string }>;  // 各维度仅保留 text，去掉 score
  people: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string }[];
};

type SingleMarriageResult = {
  yuanType: string;        // "正缘明朗" | "佳期可期" | "缘待时机" | "水到渠成"
  summary: string;
  details: Record<string, { text: string }>;
  timing: { text: string; bestYears: number[] };
  spousePortrait: { text: string; element: ElementName };
  person: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string };
};
```

**计算逻辑改造：**

- 各 `scoreXxx()` 函数改为返回 `{ level: "吉" | "平" | "慎", text: string }` 而非 `{ score: number, text: string }`
- 加权求分 → 条件判断定 `yuanType`
- `details` 中不再保留 score
- `timing` 和 `spousePortrait` 不再标"订阅" — 全部直接返回

### 3.2 `src/lib/templates/marriage.ts`

从3句傀儡文本改为按维度生成结构化的专业解读。内容标准对齐 `getBaziFreeReading` 的品质：

```ts
export function getMarriageFreeReading(result: MarriageResult | SingleMarriageResult) {
  // 双人模式：4-5段专业分析
  // 单人模式：4-5段专业分析
}
```

每段包含：
- 传统术语的准确使用（天干五合、地支六合、纳音等）
- 实际分析而非泛泛而谈
- 长度对齐八字解读（每段2-3句）

### 3.3 `POST /api/marriage`

去掉 `reading` 生成逻辑中的"订阅后可解锁"尾巴。

---

## 四、深度详批（后续实现）

新增文件：
- `src/app/api/reports/marriage/route.ts`
- `src/app/reports/marriage/[id]/page.tsx`
- `src/app/reports/marriage/[id]/layout.tsx`
- `src/lib/marriage-deep-report.ts`

机制跟八字深度详批完全一致：AI生成 → 保存 → 跳转独立报告页。

---

## 五、不做的范围

- 不新增API字段（只删不改）
- 不动订阅体系本身
- 不动八字、黄历、运势、易经模块
- 不新增付费墙
- 深度详批先留入口，报告生成逻辑可后续迭代

---

## 六、改动文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/marriage/page.tsx` | 重写 | 去掉VIP状态管理，对齐BaziPage结构 |
| `src/components/marriage/MarriageResult.tsx` | 重写 | 去掉评分/分数/VIP特效，全维度展示 |
| `src/lib/marriage.ts` | 改造 | 去score改yuanType，去VIP分层 |
| `src/lib/templates/marriage.ts` | 重写 | 扩充专业解读内容 |
| `src/components/marriage/MarriageInput.tsx` | 不改 | 现有实现OK |
| `src/app/api/marriage/route.ts` | 小改 | 去订阅引导文字 |

新增文件：

| 文件 | 说明 |
|------|------|
| `src/components/marriage/MarriageDeepReportOffer.tsx` | 深度详批CTA |

---

## 七、实现顺序

1. `src/lib/marriage.ts` — 去score改缘型，timing/spousePortrait去订阅标记
2. `src/lib/templates/marriage.ts` — 重写解读模板
3. `src/app/api/marriage/route.ts` — 去订阅引导文字
4. `src/components/marriage/MarriageResult.tsx` — 重写展示组件
5. `src/app/marriage/page.tsx` — 去VIP状态管理
6. `src/components/marriage/MarriageDeepReportOffer.tsx` — 新增深度详批CTA
