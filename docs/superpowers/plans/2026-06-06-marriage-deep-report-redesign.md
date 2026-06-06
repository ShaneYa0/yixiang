# 合盘深度解读重构 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构`marriage-deep-report.ts`，单人版从10节重组为8节（去重+去模板），双人版从5节扩展为8节

**Architecture:** 单一文件重构（`src/lib/marriage-deep-report.ts`），保留所有分析helper函数，重写section构建逻辑和两个主builder函数。不改变类型接口，不触及UI层

**Tech Stack:** TypeScript, 纯函数式（无外部依赖），所有文本基于规则推导

**Spec:** `docs/superpowers/specs/2026-06-06-marriage-deep-report-redesign.md`

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/lib/marriage-deep-report.ts` | **主要变更**：分析helper + section builder + 两个主builder |
| `src/lib/shensha.ts` | 不变（神煞计算和汇总逻辑已足够） |
| `src/lib/marriage.ts` | 不变（核心八字计算和合婚逻辑不变） |
| `src/lib/types.ts` | 不变（`DeepReportSection`和`MarriageDeepReport`类型已足够） |

---

### Task 1: 清理 — 删除废弃的模板和评分代码

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

**变更清单**：
1. 删除 `elementRelationTraits` 常量（第421-427行，纯模板，5种五行5套预设文本）
2. 删除 `changShengDetailed` 常量（第404-417行，12套预设文本，其中的mode用于headline但可以内联）
3. 删除 `buildCrossDimensionSynthesis` 函数（第328-400行，14分加权评分在传统子平法无出处）
4. 删除 `getShenShaProfile` 函数（第446-452行，用内联逻辑替代）

- [ ] **Step 1: 定位并注释掉待删除代码**

首先在文件末尾添加一个注释块标记废弃代码的位置，确保后续任务可以引用保留的函数。

- [ ] **Step 2: 删除 `elementRelationTraits`**

```typescript
// 删除第421-427行：
// const elementRelationTraits: Record<string, { attraction: string; behavior: string; match: string; avoid: string }> = { ... }
```

- [ ] **Step 3: 删除 `changShengDetailed`**

```typescript
// 删除第404-417行：
// const changShengDetailed: Record<string, { mode: string; relationship: string; timing: string; advice: string }> = { ... }
```

替换为一个轻量级映射，只保留 mode 用于 headline：

```typescript
const changShengMode: Record<string, string> = {
  "长生": "主动型", "沐浴": "魅力型", "冠带": "稳重型", "临官": "进取型",
  "帝旺": "主导型", "衰": "慢热型", "病": "敏感型", "死": "内敛型",
  "墓": "谨慎型", "绝": "突破型", "胎": "包容型", "养": "滋养型",
};
```

- [ ] **Step 4: 删除 `buildCrossDimensionSynthesis` 函数**（第328-400行）

整个函数移除，综合研判在第7节重新实现。

- [ ] **Step 5: 删除 `getShenShaProfile` 函数**（第446-452行）

神煞信息的提取改为在section builder中内联完成。

- [ ] **Step 6: 运行现有测试确保不引入编译错误**

```bash
npx tsc --noEmit src/lib/marriage-deep-report.ts
```

- [ ] **Step 7: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "refactor: 删除深度报告中的模板代码和伪评分系统

- 移除 elementRelationTraits（5行5套预设文本，纯模板）
- 移除 changShengDetailed（12套预设文本，替换为轻量mode映射）
- 移除 buildCrossDimensionSynthesis（14分加权评分无经典出处）
- 移除 getShenShaProfile（逻辑内联到section builder）

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 新增共享辅助函数

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

**新增函数**：

1. `filterPriorityShenSha()` — 神煞优先级筛选
2. `buildAppendix()` — 附录生成
3. `buildBaziOverviewTable()` — 八字总览表格数据
4. `analyzeYearlyActivation()` — 流年逐详解

- [ ] **Step 1: 添加神煞优先级筛选函数**

```typescript
/** 筛选高权重姻缘神煞（只保留日柱/月柱 + 必列神煞） */
function filterPriorityShenSha(items: ShenShaItem[]): {
  primary: ShenShaItem[];   // 落在日柱的神煞（权重最高）
  secondary: ShenShaItem[]; // 落在月柱的神煞
  other: ShenShaItem[];     // 其他柱位但属于必列神煞类型
} {
  const alwaysShow = new Set(["天乙贵人", "红鸾", "天喜", "咸池", "孤辰", "寡宿", "孤鸾煞", "阴差阳错", "羊刃"]);
  
  const primary = items.filter(s => s.position === "日柱" && alwaysShow.has(s.name));
  const secondary = items.filter(s => s.position === "月柱" && alwaysShow.has(s.name));
  const other = items.filter(s => 
    s.position !== "日柱" && s.position !== "月柱" && alwaysShow.has(s.name)
  );
  
  // 补充：日柱/月柱上的非必列但仍有参考价值的神煞
  const extraOnDay = items.filter(s => s.position === "日柱" && !alwaysShow.has(s.name));
  const extraOnMonth = items.filter(s => s.position === "月柱" && !alwaysShow.has(s.name));
  
  return {
    primary: [...primary, ...extraOnDay],
    secondary: [...secondary, ...extraOnMonth],
    other,
  };
}
```

- [ ] **Step 2: 添加流年逐详解函数**

```typescript
/** 为单个引动年份生成详细解读 */
function analyzeYearlyDetail(
  year: number,
  ganZhi: string,
  dayStem: string,
  dayBranch: string,
  spouseStars: string[],
  peachBranch: string,
): { type: string; detail: string; advice: string } | null {
  const yearStem = ganZhi[0];
  const yearBranch = ganZhi[1];
  const triggers: string[] = [];
  const details: string[] = [];
  
  // 桃花星引动
  if (yearBranch === peachBranch) {
    triggers.push("桃花到位");
    details.push(`流年地支${yearBranch}落桃花位，这一年人际关系温度升高，容易被关注和靠近。`);
  }
  
  // 日支六合
  if (LIU_HE[yearBranch] === dayBranch) {
    triggers.push("合婚姻宫");
    details.push(`流年${yearBranch}与日支${dayBranch}六合，婚姻宫被引动，关系容易在此年趋于稳定和深化。`);
  }
  
  // 日支六冲
  if (LIU_CHONG[yearBranch] === dayBranch) {
    triggers.push("冲婚姻宫");
    details.push(`流年${yearBranch}与日支${dayBranch}六冲，婚姻宫被冲动，关系中可能出现重要变动或重新定义。`);
  }
  
  // 天干五合
  const TIAN_GAN_HE: Record<string, string> = {
    "甲": "己", "己": "甲", "乙": "庚", "庚": "乙", "丙": "辛", "辛": "丙",
    "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊",
  };
  if (TIAN_GAN_HE[yearStem] === dayStem) {
    triggers.push("天干五合");
    details.push(`流年天干${yearStem}与日主${dayStem}五合，这一年人际吸引力自然提升，适合主动沟通。`);
  }
  
  // 三合
  const SAN_HE: Record<string, string[]> = {
    "申": ["子", "辰"], "子": ["申", "辰"], "辰": ["申", "子"],
    "亥": ["卯", "未"], "卯": ["亥", "未"], "未": ["亥", "卯"],
    "寅": ["午", "戌"], "午": ["寅", "戌"], "戌": ["寅", "午"],
    "巳": ["酉", "丑"], "酉": ["巳", "丑"], "丑": ["巳", "酉"],
  };
  if (SAN_HE[yearBranch]?.includes(dayBranch)) {
    triggers.push("三合日支");
    details.push(`流年${yearBranch}与日支${dayBranch}成三合关系，感情中长期走向趋于明朗。`);
  }
  
  if (triggers.length === 0) return null;
  
  const type = triggers.join("+");
  const detail = details.join(" ");
  
  // 基于引动类型生成建议
  let advice = "";
  if (triggers.includes("合婚姻宫")) {
    advice = "适合推进关系承诺、讨论长期规划";
  } else if (triggers.includes("冲婚姻宫")) {
    advice = "变动中保持冷静，重大决定多给自己一些时间";
  } else if (triggers.includes("桃花到位")) {
    advice = "扩大社交圈，出现在对的场合，但不要急于下结论";
  } else if (triggers.includes("天干五合")) {
    advice = "适合主动沟通、修复或加深重要关系";
  } else {
    advice = "保持开放心态，顺势而为";
  }
  
  return { type, detail, advice };
}
```

- [ ] **Step 3: 添加附录生成函数**

```typescript
/** 生成命理依据附录 */
function buildAppendixBody(): string {
  const rules = [
    { rule: "天干五合", source: "《三命通会·论合》", note: "甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火" },
    { rule: "地支六合", source: "《渊海子平》", note: "子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土" },
    { rule: "地支六冲", source: "《渊海子平》", note: "子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲" },
    { rule: "地支六害", source: "《三命通会》", note: "子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害" },
    { rule: "十二长生", source: "《五行大义》", note: "长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养" },
    { rule: "十神", source: "《子平真诠》", note: "正官、七杀、正财、偏财、正印、偏印、食神、伤官、比肩、劫财" },
    { rule: "天乙贵人", source: "《三命通会》", note: "甲戊庚见丑未，乙己见子申，丙丁见亥酉，壬癸见卯巳，辛见午寅" },
    { rule: "红鸾天喜", source: "《星平会海》", note: "以年支起红鸾，对宫为天喜" },
    { rule: "咸池（桃花）", source: "《三命通会》", note: "申子辰在酉，寅午戌在卯，亥卯未在子，巳酉丑在午" },
  ];
  
  return [
    "本报告基于以下传统命理规则进行推导，所有分析均有经典出处：",
    "",
    ...rules.map((r, i) => `${String(i + 1)}. **${r.rule}**（${r.source}）：${r.note}`),
    "",
    "---",
    "",
    "**免责声明**：八字命理分析属于传统文化范畴，报告内容仅供参考和反思，不构成对未来的确定性预测。",
    "任何命理维度的好与不好，都不能替代个人在现实中的选择和经营。",
    "每一段关系都是独一无二的——你们的经历、选择和努力比任何命理维度都重要。",
  ].join("\n");
}
```

- [ ] **Step 4: 验证编译**

```bash
npx tsc --noEmit src/lib/marriage-deep-report.ts
# Expected: no errors
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "feat: 添加深度报告新辅助函数

- filterPriorityShenSha：神煞按柱位优先级筛选
- analyzeYearlyDetail：流年逐详解（引动类型+解读+建议）
- buildAppendixBody：命理依据附录生成

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 构建单人版 Section Builder（第1-4节）

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

**新建函数**：
- `buildSoloSection1_BaziOverview()` — 命盘总览
- `buildSoloSection2_MarriagePalace()` — 婚姻宫精析（合并原#2+#3）
- `buildSoloSection3_SpouseStar()` — 配偶星全维分析（合并原#4+#5+#7）
- `buildSoloSection4_ShenSha()` — 神煞关键信号（精简原#1）

- [ ] **Step 1: 构建第1节 — 命盘总览**

```typescript
function buildSoloSection1_BaziOverview(
  bazi: BaziResult,
  baziOverview: NonNullable<MarriageDeepReport["baziOverview"]>,
): DeepReportSection {
  const dayStem = bazi.pillars[2].ganZhi[0];
  const dayBranch = bazi.pillars[2].ganZhi[1];
  
  // 四柱表格
  const tableRows = baziOverview.pillars.map(p => {
    const hiddenDisplay = p.hiddenTenGods.length > 0 ? p.hiddenTenGods.join("、") : "—";
    return `| ${p.label} | ${p.ganZhi} | ${p.nayin} | ${p.tenGod} | ${hiddenDisplay} | ${p.element} | ${p.xunKong} |`;
  });
  
  const tableHeader = "| 柱位 | 干支 | 纳音 | 十神 | 藏干 | 五行 | 空亡 |\n|------|------|------|------|------|------|------|";
  
  // 日主信息
  const elementsDisplay = Object.entries(bazi.elements)
    .map(([el, count]) => `${el}${count}`)
    .join(" · ");
  
  const body = [
    "以下为本命盘的四柱八字全貌，后续所有分析均基于此盘展开：",
    "",
    tableHeader,
    ...tableRows,
    "",
    `**日主**：${bazi.dayMaster}（${bazi.dominantElement}）| **强弱**：${bazi.strength} | **用神**：${bazi.usefulElements.join("、") || "需结合大运再定"}`,
    `**五行分布**：${elementsDisplay}`,
    `**生肖**：${bazi.zodiac} | **命宫**：${bazi.mingGong} | **身宫**：${bazi.shenGong}`,
    "",
    generateBaziOverviewIntro(dayStem, bazi.strength, bazi.dominantElement),
  ].join("\n");
  
  return {
    title: "命盘总览",
    subtitle: `${bazi.dayMaster}日主 · ${bazi.strength} · ${bazi.dominantElement}命`,
    body,
    highlights: [bazi.dayMaster, bazi.dominantElement, bazi.strength, bazi.zodiac],
    data: { pillars: baziOverview.pillars, dayMaster: bazi.dayMaster, elements: bazi.elements, strength: bazi.strength, usefulElements: bazi.usefulElements },
  };
}

function generateBaziOverviewIntro(dayStem: string, strength: string, dominantElement: string): string {
  const strengthExplained = strength === "偏旺" 
    ? "日主偏旺，命局中自身力量较强。在感情中倾向于主导和付出，需要注意给对方表达的空间。"
    : strength === "偏弱"
      ? "日主偏弱，命局中需要外界支持。在感情中更倾向于被引领和滋养，适合找一个能给你安全感的伴侣。"
      : "日主中和，命局五行较为均衡。在感情中有较好的适应性——既能给予也能接受，关系中的弹性较强。";
  
  return [
    `日主${dayStem}属${dominantElement}，为命局核心。${strengthExplained}`,
    "日主（出生日的天干）代表命主自身，是八字分析的参照中心。日支（出生日的地支）为婚姻宫，代表婚姻关系的根基和底色。",
    "后续各节将基于以上数据，从婚姻宫、配偶星、神煞、大运流年等维度逐一展开分析。",
  ].join("\n\n");
}
```

- [ ] **Step 2: 构建第2节 — 婚姻宫精析（合并原#2+#3）**

```typescript
function buildSoloSection2_MarriagePalace(
  dayBranch: string,
  dayStem: string,
  dayPillar: { ganZhi: string; nayin: string; hiddenTenGods: string[]; element: string },
  pillars: { label: string; ganZhi: string; tenGod: string; hiddenTenGods: string[]; element: string }[],
  spouseStars: string[],
): DeepReportSection {
  const BRANCH_MAIN_ELEMENT: Record<string, string> = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
    "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
  };
  const STEM_ELEMENT: Record<string, string> = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
    "庚": "金", "辛": "金", "壬": "水", "癸": "水",
  };
  const GENERATING: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
  const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };
  
  const branchElement = BRANCH_MAIN_ELEMENT[dayBranch] ?? "土";
  const stemElement = STEM_ELEMENT[dayStem] ?? "土";
  
  const parts: string[] = [];
  
  // 1. 基本信息
  const hiddenDisplay = dayPillar.hiddenTenGods.length > 0
    ? dayPillar.hiddenTenGods.join("、")
    : "无";
  parts.push(`婚姻宫为日支「**${dayBranch}**」，五行属**${branchElement}**，纳音「${dayPillar.nayin}」，藏干：${hiddenDisplay}。`);
  
  // 2. 日主与婚姻宫的生克关系
  if (stemElement === branchElement) {
    parts.push(`日主五行与婚姻宫五行同为${stemElement}，**同气相求**。在专业八字中这意味着：你与伴侣在核心价值观和生活方式上天然趋同，默契度高。同气婚姻宫的优势是稳定和谐，潜在的课题是关系中可能缺少互补的张力——偶尔需要一些"不同"来保持活力。`);
  } else if (GENERATING[stemElement] === branchElement) {
    parts.push(`日主${stemElement}生婚姻宫${branchElement}，传统术语称"**日主生婚姻宫**"。取象上常用于观察命主对关系的投入倾向——你天然倾向于为婚姻付出。需结合日主强弱判断这种付出是主动滋养还是被动消耗。`);
  } else if (GENERATING[branchElement] === stemElement) {
    parts.push(`婚姻宫${branchElement}生日主${stemElement}，传统术语称"**婚姻宫生身**"。取象上可视为婚姻关系对日主有滋养作用——在健康的婚姻中，你能感受到被支持和被滋养。`);
  } else if (CONTROLLING[stemElement] === branchElement) {
    parts.push(`日主${stemElement}克婚姻宫${branchElement}，传统术语称"**日主克婚姻宫**"。取象上提示日主与婚姻宫存在制约关系——你倾向于在关系中占据主导位置。需结合日主强弱判断这是健康的管理还是过度的控制。`);
  } else if (CONTROLLING[branchElement] === stemElement) {
    parts.push(`婚姻宫${branchElement}克日主${stemElement}，传统术语称"**婚姻宫克身**"。提示婚姻关系可能对你形成一定的压力和约束。这不代表婚姻不好——很多有责任心的人恰恰在婚姻宫克身的结构中找到成长的动力。`);
  }
  
  // 3. 与其他柱位的合冲刑害（权重从高到低：月柱 > 时柱 > 年柱）
  const otherPillars = pillars.filter(p => p.label !== "日柱");
  const interactions = analyzeDayBranchInteractions(dayBranch, otherPillars.map(p => ({ label: p.label, branch: p.ganZhi[1] })));
  const dayStemInteractions = analyzeDayStemInteractions(dayStem, otherPillars.map(p => ({ label: p.label, stem: p.ganZhi[0] })));
  
  if (interactions.length > 0) {
    parts.push("");
    parts.push("### 日支与其他柱位的互动");
    
    // 按重要性排序：冲 > 合 > 害 > 三合 > 半合
    const priorityOrder: Record<string, number> = { "冲": 1, "合": 2, "害": 3, "三合": 4, "半合": 5, "刑": 6 };
    const sorted = [...interactions].sort((a, b) => (priorityOrder[a.type] ?? 9) - (priorityOrder[b.type] ?? 9));
    
    for (const inter of sorted) {
      const icon = inter.type === "冲" ? "⚡" : inter.type === "害" ? "⚠" : inter.type === "合" || inter.type === "三合" ? "⊕" : "○";
      parts.push(`- ${icon} **${inter.target}${inter.type}**：${inter.description}`);
    }
  } else {
    parts.push("");
    parts.push("日支与其他柱位无明显的合冲刑害关系，婚姻宫处于相对独立的稳定状态。外部环境对婚姻的干扰较小，关系更多由你和伴侣的内在动力决定。");
  }
  
  // 4. 日干合相
  if (dayStemInteractions.length > 0) {
    parts.push("");
    parts.push("### 日干合相");
    for (const inter of dayStemInteractions) {
      parts.push(`- ${inter.description}`);
    }
  }
  
  // 5. 藏干中的配偶星
  const spouseInHidden = dayPillar.hiddenTenGods.filter(t => spouseStars.includes(t));
  if (spouseInHidden.length > 0) {
    parts.push("");
    parts.push(`婚姻宫藏干中含配偶星**${spouseInHidden.join("、")}**——配偶星入婚姻宫藏干，是姻缘结构稳固的重要标志。你的伴侣和婚姻关系本身存在天然的契合。`);
  }
  
  const body = parts.join("\n");
  
  // Highlights
  const hl: string[] = [dayBranch, dayPillar.nayin];
  if (interactions.length > 0) hl.push(...interactions.slice(0, 2).map(i => `${i.target}${i.type}`));
  if (spouseInHidden.length > 0) hl.push("配偶星入宫");
  
  return {
    title: "婚姻宫精析",
    subtitle: `日支「${dayBranch}」· ${dayPillar.nayin}`,
    body,
    highlights: hl.slice(0, 4),
  };
}
```

- [ ] **Step 3: 构建第3节 — 配偶星全维分析**

```typescript
function buildSoloSection3_SpouseStar(
  spouseStars: string[],
  spouseAnalysis: ReturnType<typeof evaluateSpouseStarQuality>,
  tenGodFindings: string[],
  dayStem: string,
  dayBranch: string,
  dominantElement: string,
  gender: string,
): DeepReportSection {
  const parts: string[] = [];
  
  // 1. 配偶星定义
  parts.push(`命主为${gender === "male" ? "男性" : "女性"}，在传统子平法中，${gender === "male" ? "男命以**财星**为配偶星（正财代表稳定伴侣，偏财代表恋爱对象或非传统关系）" : "女命以**官杀**为配偶星（正官代表稳定伴侣，七杀代表恋爱对象或非传统关系）"}。本命配偶星为「**${spouseStars.join("、")}**」。`);
  
  // 2. 出现情况 + 质量评级
  parts.push("");
  parts.push(`### 配偶星配置`);
  parts.push(`配偶星在四柱中出现 **${spouseAnalysis.totalCount}** 次（天干透出 ${spouseAnalysis.surfaceCount} 次，地支藏干 ${spouseAnalysis.hiddenCount} 次），综合评级：「**${spouseAnalysis.quality}**」。`);
  parts.push("");
  parts.push(spouseAnalysis.analysis);
  
  if (spouseAnalysis.positions.length > 0) {
    parts.push(`出现位置：${spouseAnalysis.positions.join("、")}。`);
  }
  
  // 3. 得令分析
  const spouseHitsWithElement = spouseAnalysis.spouseHits.filter(h => h.element);
  if (spouseHitsWithElement.length > 0) {
    parts.push("");
    parts.push("### 配偶星得令判断");
    // 检查月令生克（配偶星是否得月令生扶）
    const monthElement = spouseAnalysis.spouseHits.find(h => h.label === "月柱")?.element;
    const firstSpouseElement = spouseHitsWithElement[0]?.element;
    if (firstSpouseElement) {
      const GENERATING: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
      const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };
      if (monthElement && GENERATING[monthElement] === firstSpouseElement) {
        parts.push(`配偶星得月令生扶（月令${monthElement}生配偶星${firstSpouseElement}），配偶星有根有气。在适婚年龄遇到的伴侣素质较高，缘分落地后对方能成为有力支持。`);
      } else if (monthElement && CONTROLLING[monthElement] === firstSpouseElement) {
        parts.push(`配偶星被月令克制（月令${monthElement}克配偶星${firstSpouseElement}），配偶星力量偏弱。缘分落地需要更多时间和耐心，但一旦遇到大运生扶，后期的缘分质量可能超出早期预期。`);
      } else {
        parts.push("配偶星与月令无直接生克关系，配偶星力量中等，缘分节奏正常。");
      }
    }
  }
  
  // 4. 配偶画像（带明确免责声明）
  const portraitText = deriveSpousePortrait(spouseStars, spouseAnalysis.spouseHits, dayStem, dayBranch, dominantElement);
  parts.push("");
  parts.push("### 配偶星取象与配偶画像");
  parts.push(portraitText);
  parts.push("");
  parts.push("> ⚠️ 以上仅为配偶星五行与柱位的传统取象，不等同于伴侣的实际性格、职业、外貌或相识方式。");
  
  // 5. 十神格局信号（仅在实际存在时列出）
  if (tenGodFindings.length > 0) {
    parts.push("");
    parts.push("### 十神格局中的感情信号");
    for (let i = 0; i < tenGodFindings.length; i++) {
      parts.push(`${String(i + 1)}. ${tenGodFindings[i]}`);
    }
  }
  
  const body = parts.join("\n");
  
  return {
    title: "配偶星全维分析",
    subtitle: `配偶星：${spouseStars.join("、")} · 评级：${spouseAnalysis.quality}`,
    body,
    highlights: [`${spouseAnalysis.totalCount}次出现`, spouseAnalysis.quality, ...spouseAnalysis.positions.slice(0, 2)],
  };
}
```

- [ ] **Step 4: 构建第4节 — 神煞关键信号**

```typescript
function buildSoloSection4_ShenSha(
  shenShaItems: ShenShaItem[],
  ji: ShenShaItem[],
  xiong: ShenShaItem[],
  neutral: ShenShaItem[],
  dayBranch: string,
  spouseHits: { label: string; ganZhi: string }[],
  dayStem: string,
): DeepReportSection {
  const { primary, secondary, other } = filterPriorityShenSha(shenShaItems);
  const parts: string[] = [];
  
  parts.push(`命盘中共出现 ${shenShaItems.length} 颗姻缘相关神煞（吉神 ${ji.length} · 中性 ${neutral.length} · 需留意 ${xiong.length}）。以下仅展开对婚姻宫有直接影响的重点神煞，完整神煞列表见文末附录。`);
  parts.push("");
  
  // 按优先级展示
  if (primary.length > 0) {
    parts.push("### 婚姻宫神煞（权重最高）");
    for (const s of primary) {
      const profile = shenShaProfiles[s.name];
      const posAnalysis = profile?.positionWeight?.[s.position] ?? s.meaning;
      parts.push(`**${s.name}**（日柱）`);
      parts.push(`> 取法：${profile?.basis ?? "依传统口诀推导"}`);
      parts.push(`> ${posAnalysis}`);
      parts.push("");
    }
  }
  
  if (secondary.length > 0) {
    parts.push("### 月柱神煞（适婚年龄阶段）");
    for (const s of secondary) {
      const profile = shenShaProfiles[s.name];
      const posAnalysis = profile?.positionWeight?.[s.position] ?? s.meaning;
      parts.push(`**${s.name}**（月柱）`);
      parts.push(`> ${posAnalysis}`);
      parts.push("");
    }
  }
  
  if (other.length > 0 && other.length <= 3) {
    parts.push("### 其他柱位关键神煞");
    for (const s of other) {
      parts.push(`- **${s.name}**（${s.position}）：${s.meaning}`);
    }
    parts.push("");
  }
  
  // 神煞联动分析
  const synthesis = synthesizeShenSha(ji, xiong, neutral, dayBranch, spouseHits);
  if (synthesis) {
    parts.push("### 神煞联动研判");
    parts.push(synthesis);
  }
  
  const body = parts.join("\n");
  
  return {
    title: "神煞关键信号",
    subtitle: `${primary.length + secondary.length} 颗重点神煞 · ${primary.length} 颗坐婚姻宫`,
    body,
    highlights: [...primary.map(s => s.name), ...secondary.map(s => s.name)].slice(0, 6),
    data: { primary: primary.map(s => ({ name: s.name, position: s.position })), secondary: secondary.map(s => ({ name: s.name, position: s.position })), jiCount: ji.length, xiongCount: xiong.length },
  };
}
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit src/lib/marriage-deep-report.ts
```

- [ ] **Step 6: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "feat: 实现单人深度报告第1-4节section builder

- 第1节 命盘总览：四柱全表+日主+五行+白话导读
- 第2节 婚姻宫精析：合并原#2+#3，日支生克+柱位互动+藏干
- 第3节 配偶星全维分析：合并原#4+#5+#7，配置+得令+画像+十神
- 第4节 神煞关键信号：精简聚焦，只展示高权重神煞

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: 构建单人版 Section Builder（第5-8节）

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

**新建函数**：
- `buildSoloSection5_LuckCycles()` — 大运婚姻走势
- `buildSoloSection6_YearlyActivation()` — 流年引动节点
- `buildSoloSection7_Synthesis()` — 综合研判与建议
- `buildSoloSection8_Appendix()` — 附录

- [ ] **Step 1: 构建第5节 — 大运婚姻走势**

```typescript
function buildSoloSection5_LuckCycles(
  luckCycles: LuckCycle[],
  currentCycle: LuckCycle | undefined,
  dayStem: string,
  dayBranch: string,
  spouseStars: string[],
  yearBranch: string,
): DeepReportSection {
  const STEM_ELEMENT: Record<string, string> = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
    "庚": "金", "辛": "金", "壬": "水", "癸": "水",
  };
  const BRANCH_MAIN_ELEMENT: Record<string, string> = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
    "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
  };
  
  const xianChiBranch = ["申", "子", "辰"].includes(yearBranch) ? "酉"
    : ["寅", "午", "戌"].includes(yearBranch) ? "卯"
    : ["亥", "卯", "未"].includes(yearBranch) ? "子" : "午";
  
  const cycleBlocks: string[] = [];
  
  for (const cycle of luckCycles) {
    const isCurrent = cycle === currentCycle;
    const cStem = cycle.ganZhi[0];
    const cBranch = cycle.ganZhi[1];
    const lines: string[] = [];
    
    // Header
    lines.push(`### ${isCurrent ? "▶ " : ""}${cycle.ganZhi}（${cycle.startAge}-${cycle.endAge}岁）${isCurrent ? " ← 当前大运" : ""}`);
    lines.push("");
    
    // 对日主影响
    const stemEl = STEM_ELEMENT[cStem] ?? "土";
    const dayStemEl = STEM_ELEMENT[dayStem] ?? "土";
    const stemRel = describeElementRelation(dayStemEl, stemEl);
    if (stemRel === "生扶") {
      lines.push(`- **日主**：大运天干${cStem}(${stemEl})生扶日主${dayStem}(${dayStemEl})，此运中自身能量得到加强，在感情中更主动和有底气。`);
    } else if (stemRel === "受生") {
      lines.push(`- **日主**：日主${dayStem}(${dayStemEl})生大运天干${cStem}(${stemEl})，此运中自身能量有所消耗，感情中可能倾向于付出而非索取。`);
    } else if (stemRel === "同气") {
      lines.push(`- **日主**：大运天干${cStem}与日主${dayStem}同为${stemEl}，此运中自我意识和行动力同步增强。`);
    } else if (stemRel === "相克" || stemRel === "受克") {
      lines.push(`- **日主**：大运天干${cStem}(${stemEl})与日主${dayStem}(${dayStemEl})相克，此运中可能面临外部压力和挑战，感情方面需要更多耐心。`);
    }
    
    // 对婚姻宫影响
    if (cBranch === dayBranch) {
      lines.push(`- **婚姻宫**：大运地支与日支同为${dayBranch}（伏吟），婚姻宫被引动，此运中婚姻相关议题频繁出现，是感情走向稳定的关键十年。`);
    } else if (LIU_HE[cBranch] === dayBranch) {
      lines.push(`- **婚姻宫**：大运支${cBranch}与日支${dayBranch}六合，婚姻宫被合住——此运中关系容易趋于稳定和深化，是推进婚姻承诺的有利时段。`);
    } else if (LIU_CHONG[cBranch] === dayBranch) {
      lines.push(`- **婚姻宫**：大运支${cBranch}与日支${dayBranch}六冲，婚姻宫被冲动——此运中感情生活可能出现重要变动。冲不等于分离，也可能是关系的升级或重新定义。`);
    } else if (LIU_HAI[cBranch] === dayBranch) {
      lines.push(`- **婚姻宫**：大运支${cBranch}与日支${dayBranch}六害，关系中需注意慢性不协调因素。`);
    } else {
      const branchEl = BRANCH_MAIN_ELEMENT[cBranch] ?? "土";
      const dayBranchEl = BRANCH_MAIN_ELEMENT[dayBranch] ?? "土";
      lines.push(`- **婚姻宫**：大运地支${cBranch}(${branchEl})与日支${dayBranch}(${dayBranchEl})无直接合冲刑害，婚姻宫在此运中相对平稳。`);
    }
    
    // 配偶星引动
    if (spouseStars.includes(cStem)) {
      lines.push(`- **配偶星**：大运天干${cStem}为配偶星透出，此运中缘分信号强烈，是认识正缘或关系升级的重要阶段。`);
    }
    
    // 桃花引动
    if (cBranch === xianChiBranch) {
      lines.push(`- **桃花**：大运支${cBranch}落桃花位，此运中社交机会增多，容易被关注和靠近。桃花代表机遇，但筛选比数量更重要。`);
    }
    
    lines.push("");
    cycleBlocks.push(lines.join("\n"));
  }
  
  const keyCount = luckCycles.filter(c => {
    const cBranch = c.ganZhi[1];
    return cBranch === dayBranch || LIU_HE[cBranch] === dayBranch || LIU_CHONG[cBranch] === dayBranch
      || spouseStars.includes(c.ganZhi[0]) || cBranch === xianChiBranch;
  }).length;
  
  return {
    title: "大运婚姻走势",
    subtitle: `${luckCycles.length}步大运 · ${keyCount}步有直接姻缘信号`,
    body: [
      "每一步大运约十年，以下逐运分析对婚姻宫（日支）和配偶星的影响。标记「▶」的为当前所在大运：",
      "",
      ...cycleBlocks,
      "大运分析基于八字起运推算。伏吟主变动和强化，六合主稳定和深化，六冲主变动和重新定义，桃花到位主机遇增多，配偶星透干主缘分触发。",
    ].join("\n"),
    highlights: luckCycles.filter(c => {
      const cBranch = c.ganZhi[1];
      return cBranch === dayBranch || LIU_HE[cBranch] === dayBranch || LIU_CHONG[cBranch] === dayBranch
        || spouseStars.includes(c.ganZhi[0]) || cBranch === xianChiBranch;
    }).slice(0, 4).map(c => `${c.ganZhi}（${c.startAge}-${c.endAge}岁）`),
    data: { keyCount, totalCycles: luckCycles.length },
  };
}
```

- [ ] **Step 2: 构建第6节 — 流年引动节点**

```typescript
function buildSoloSection6_YearlyActivation(
  timing: { pastYears: number[]; currentYear: number | null; futureYears: number[]; yearReasons: Record<number, string> },
  luckCycles: LuckCycle[],
  dayStem: string,
  dayBranch: string,
  spouseStars: string[],
  yearBranch: string,
): DeepReportSection {
  const now = new Date().getFullYear();
  const parts: string[] = [];
  
  // 桃花位
  const peachBranch = ["申", "子", "辰"].includes(yearBranch) ? "酉"
    : ["寅", "午", "戌"].includes(yearBranch) ? "卯"
    : ["亥", "卯", "未"].includes(yearBranch) ? "子" : "午";
  
  // 收集未来年份的流年干支
  const yearGanZhiMap: Record<number, string> = {};
  for (const cycle of luckCycles) {
    for (const y of cycle.years) {
      if (y.year >= now - 2 && y.year <= now + 8) {
        yearGanZhiMap[y.year] = y.ganZhi;
      }
    }
  }
  
  parts.push("基于大运流年分析，以下年份对婚姻宫或配偶星产生直接引动，是感情层面的重要时间节点：");
  parts.push("");
  
  // 当前年
  if (timing.currentYear) {
    parts.push(`### ▶ ${timing.currentYear}年（今年）`);
    const ganZhi = yearGanZhiMap[timing.currentYear] ?? "";
    const detail = analyzeYearlyDetail(timing.currentYear, ganZhi, dayStem, dayBranch, spouseStars, peachBranch);
    if (detail) {
      parts.push(`**引动**：${detail.type}`);
      parts.push(detail.detail);
      parts.push(`**建议**：${detail.advice}`);
    } else if (timing.yearReasons[timing.currentYear]) {
      parts.push(timing.yearReasons[timing.currentYear]);
    }
    parts.push("");
  }
  
  // 未来年份
  if (timing.futureYears.length > 0) {
    parts.push("### 未来关键年份");
    parts.push("");
    for (const year of timing.futureYears.slice(0, 8)) {
      const ganZhi = yearGanZhiMap[year] ?? "";
      const detail = analyzeYearlyDetail(year, ganZhi, dayStem, dayBranch, spouseStars, peachBranch);
      parts.push(`**${year}年**`);
      if (detail) {
        parts.push(`- 引动：${detail.type}`);
        parts.push(`- ${detail.detail}`);
        parts.push(`- 建议：${detail.advice}`);
      } else if (timing.yearReasons[year]) {
        parts.push(`- ${timing.yearReasons[year]}`);
      }
      parts.push("");
    }
  }
  
  // 过去参考
  if (timing.pastYears.length > 0) {
    parts.push("### 过去参考年份");
    parts.push(`${timing.pastYears.join("、")} —— 这些年份发生的感情事件可以作为未来判断的参照。`);
  }
  
  return {
    title: "流年引动节点",
    subtitle: `未来 ${timing.futureYears.length} 个关键年份`,
    body: parts.join("\n"),
    highlights: timing.futureYears.slice(0, 4).map(y => String(y)),
    data: { pastYears: timing.pastYears, currentYear: timing.currentYear, futureYears: timing.futureYears, yearReasons: timing.yearReasons },
  };
}
```

- [ ] **Step 3: 构建第7节 — 综合研判与建议**

```typescript
function buildSoloSection7_Synthesis(
  bazi: BaziResult,
  spouseAnalysis: ReturnType<typeof evaluateSpouseStarQuality>,
  shenShaJi: ShenShaItem[],
  shenShaXiong: ShenShaItem[],
  interactions: InteractionResult[],
  dayChangSheng: string,
  timing: { currentYear: number | null; futureYears: number[] },
): DeepReportSection {
  const dayBranch = bazi.pillars[2].ganZhi[1];
  const dayStem = bazi.dayMaster;
  const parts: string[] = [];
  
  // 1. 核心优势（每条可追溯到前面章节）
  const strengths: string[] = [];
  
  if (shenShaJi.filter(s => s.position === "日柱").length >= 1) {
    strengths.push(`婚姻宫坐吉星（${shenShaJi.filter(s => s.position === "日柱").map(s => s.name).join("、")}），先天婚姻质量有保障基础（详见「神煞关键信号」节）。`);
  }
  if (shenShaXiong.filter(s => s.position === "日柱").length === 0) {
    strengths.push("婚姻宫无凶煞落位，避免了最直接的负面信号（详见「神煞关键信号」节）。");
  }
  if (spouseAnalysis.totalCount >= 2) {
    strengths.push(`配偶星配置有力（出现${spouseAnalysis.totalCount}次），缘分信号清晰可辨（详见「配偶星全维分析」节）。`);
  }
  if (interactions.some(i => i.type === "合" || i.type === "三合")) {
    strengths.push(`日支与它柱相合，婚姻关系有天然和谐基础（详见「婚姻宫精析」节）。`);
  }
  if (["长生", "冠带", "临官", "帝旺"].includes(dayChangSheng)) {
    strengths.push(`日主在婚姻宫处于${dayChangSheng}（上升阶段），感情主动性和能量充沛（详见「婚姻宫精析」节）。`);
  }
  if (bazi.usefulElements.includes(BRANCH_MAIN_ELEMENT[dayBranch] ?? "")) {
    strengths.push("婚姻宫为用神，婚姻对人生有正面推动作用（详见「婚姻宫精析」节）。");
  }
  if (spouseAnalysis.positions.includes("日柱")) {
    strengths.push("配偶星入婚姻宫（日柱），伴侣与婚姻关系存在天然契合（详见「配偶星全维分析」节）。");
  }
  
  // 2. 需要经营的课题
  const challenges: string[] = [];
  
  if (interactions.some(i => i.type === "冲")) {
    challenges.push(`日支被${interactions.filter(i => i.type === "冲").map(i => i.target).join("、")}冲——感情生活中需要应对外部变动和冲击。建议：在关系的重要决策上多给自己一些缓冲时间，不在被冲的年份做冲动决定。`);
  }
  if (interactions.some(i => i.type === "害")) {
    challenges.push(`日支被${interactions.filter(i => i.type === "害").map(i => i.target).join("、")}害——关系中存在慢性不协调因素。建议：定期开诚布公地沟通感受，不让小摩擦积累。`);
  }
  if (shenShaXiong.filter(s => s.position === "日柱").length >= 1) {
    const names = shenShaXiong.filter(s => s.position === "日柱").map(s => s.name).join("、");
    challenges.push(`婚姻宫需留意${names}。建议：参考「神煞关键信号」节中对应神煞的具体应对建议，这不是宿命而是需要注意的领域清单。`);
  }
  if (spouseAnalysis.totalCount <= 1) {
    challenges.push("配偶星信号偏弱——缘分需要更多主动经营和大运引动。建议：主动扩大社交圈，不在原地等缘分。");
  }
  
  // 汇总
  parts.push("### 核心优势");
  if (strengths.length > 0) {
    for (const s of strengths) parts.push(`- ${s}`);
  } else {
    parts.push("命盘中没有特别突出的先天优势信号——这并不意味着姻缘不好，而是意味着你的感情走向更多取决于后天经营而非先天配置。这是一种自由：你不是因为'命理需要'而进入关系，而是因为真正的感情选择。");
  }
  
  parts.push("");
  parts.push("### 需要经营的课题");
  if (challenges.length > 0) {
    for (const c of challenges) parts.push(`- ${c}`);
  } else {
    parts.push("盘面中未见需要特别留意的结构性问题。在保持良好沟通的基础上，顺其自然地推进关系即可。");
  }
  
  // 3. 关键时间窗口
  parts.push("");
  parts.push("### 关键时间窗口");
  if (timing.currentYear) {
    parts.push(`**当前年（${timing.currentYear}年）**即为重要窗口——详见「流年引动节点」节。`);
  }
  if (timing.futureYears.length > 0) {
    parts.push(`未来重点关注 ${timing.futureYears.slice(0, 3).join("、")} ——详见「流年引动节点」节。`);
  }
  
  // 4. 个性化建议
  parts.push("");
  parts.push("### 个性化建议");
  
  const changShengMode: Record<string, string> = {
    "长生": "主动型", "沐浴": "魅力型", "冠带": "稳重型", "临官": "进取型",
    "帝旺": "主导型", "衰": "慢热型", "病": "敏感型", "死": "内敛型",
    "墓": "谨慎型", "绝": "突破型", "胎": "包容型", "养": "滋养型",
  };
  const mode = changShengMode[dayChangSheng] ?? "稳重型";
  
  if (dayChangSheng === "长生" || dayChangSheng === "沐浴" || dayChangSheng === "临官") {
    parts.push(`你的感情模式偏${mode}——缘分主动、机遇较多。核心建议：在众多可能性中做减法，选择那个让你'安静下来'的人，而非那个让你'心跳加速'的人。`);
  } else if (dayChangSheng === "衰" || dayChangSheng === "病" || dayChangSheng === "墓" || dayChangSheng === "绝") {
    parts.push(`你的感情模式偏${mode}——节奏偏慢、缘分偏晚。核心建议：不需要因为外界压力而加速，你的节奏是合理的。重点是在等待中做好自己——好的缘分往往在你最放松的时候出现。`);
  } else {
    parts.push(`你的感情模式偏${mode}——节奏适中，有较好的适应性。核心建议：保持开放心态，在合适的流年窗口主动出击，在非窗口期做好日常经营。`);
  }
  
  const body = parts.join("\n");
  
  return {
    title: "综合研判与建议",
    subtitle: `${strengths.length}项优势 · ${challenges.length}项需要经营的课题`,
    body,
    highlights: strengths.slice(0, 2).map(s => s.slice(0, 20) + "…"),
  };
}
```

- [ ] **Step 4: 构建第8节 — 附录**

```typescript
function buildSoloSection8_Appendix(): DeepReportSection {
  return {
    title: "附录 · 命理依据",
    subtitle: "本报告所使用的主要规则及经典出处",
    body: buildAppendixBody(),
    highlights: [],
  };
}
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit src/lib/marriage-deep-report.ts
```

- [ ] **Step 6: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "feat: 实现单人深度报告第5-8节section builder

- 第5节 大运婚姻走势：每运分析日主/婚姻宫/配偶星/桃花引动
- 第6节 流年引动节点：逐详解（引动类型+解读+建议）
- 第7节 综合研判：去伪评分，改证据链追溯式总结
- 第8节 附录：经典出处+免责声明

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 重写 buildSoloDeepReport 主函数

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

- [ ] **Step 1: 重写主函数**

```typescript
export function buildSoloDeepReport(
  result: SingleMarriageResult,
  input: { birthDate: string; birthHour: number; gender: "male" | "female" },
): MarriageDeepReport {
  const id = nextId("ms");
  const bazi = calculateBazi(input);
  const pillars = bazi.pillars;
  const spouseStars = input.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  
  // ---- 八字总览 ----
  const baziOverview: NonNullable<MarriageDeepReport["baziOverview"]> = {
    pillars: pillars.map(p => ({
      label: p.label, ganZhi: p.ganZhi, nayin: p.nayin, tenGod: p.tenGod,
      hiddenTenGods: p.hiddenTenGods, element: p.element, xunKong: p.xunKong,
    })),
    dayMaster: bazi.dayMaster, dominantElement: bazi.dominantElement, zodiac: bazi.zodiac,
    elements: bazi.elements, strength: bazi.strength, shenGong: bazi.shenGong, mingGong: bazi.mingGong,
  };
  
  const dayStem = pillars[2].ganZhi[0];
  const dayBranch = pillars[2].ganZhi[1];
  const dayChangSheng = getChangShengStage(dayStem, dayBranch);
  
  // ---- 共享分析数据 ----
  const branchInteractions = analyzeDayBranchInteractions(dayBranch, [
    { label: "年柱", branch: pillars[0].ganZhi[1] },
    { label: "月柱", branch: pillars[1].ganZhi[1] },
    { label: "时柱", branch: pillars[3].ganZhi[1] },
  ]);
  
  const shenShaItems = computeShenSha(bazi.dayMaster, pillars[0].ganZhi[1], pillars);
  const { ji, neutral, xiong } = shenShaSummary(shenShaItems);
  
  const spouseAnalysis = evaluateSpouseStarQuality(baziOverview.pillars, spouseStars);
  
  const tenGodFindings = analyzeTenGodPattern(baziOverview.pillars, dayStem, input.gender);
  
  const timing = computeMarriageTiming(
    bazi, spouseStars,
    ["申", "子", "辰"].includes(pillars[0].ganZhi[1]) ? "酉"
    : ["寅", "午", "戌"].includes(pillars[0].ganZhi[1]) ? "卯"
    : ["亥", "卯", "未"].includes(pillars[0].ganZhi[1]) ? "子" : "午",
  );
  
  const yearBranch = pillars[0].ganZhi[1];
  
  // ---- 构建8个Section ----
  const sections: DeepReportSection[] = [
    buildSoloSection1_BaziOverview(bazi, baziOverview),
    buildSoloSection2_MarriagePalace(dayBranch, dayStem, {
      ganZhi: pillars[2].ganZhi, nayin: pillars[2].nayin,
      hiddenTenGods: pillars[2].hiddenTenGods, element: pillars[2].element,
    }, baziOverview.pillars, spouseStars),
    buildSoloSection3_SpouseStar(spouseStars, spouseAnalysis, tenGodFindings, dayStem, dayBranch, bazi.dominantElement, input.gender),
    buildSoloSection4_ShenSha(shenShaItems, ji, xiong, neutral, dayBranch, spouseAnalysis.spouseHits, dayStem),
    buildSoloSection5_LuckCycles(bazi.luck.cycles, bazi.luck.currentCycle, dayStem, dayBranch, spouseStars, yearBranch),
    buildSoloSection6_YearlyActivation(timing, bazi.luck.cycles, dayStem, dayBranch, spouseStars, yearBranch),
    buildSoloSection7_Synthesis(bazi, spouseAnalysis, ji, xiong, branchInteractions, dayChangSheng, timing),
    buildSoloSection8_Appendix(),
  ];
  
  // ---- Headline ----
  const headlineMap: Record<string, string> = {
    "正缘明朗": "配偶星透干有力，姻缘结构清晰",
    "佳期可期": "配偶星有所显现，缘分基础良好",
    "缘待时机": "配偶星偏隐，等待大运引动",
    "水到渠成": "顺其自然，缘分在日常中浮现",
  };
  
  // ---- Summary ----
  const summary = (() => {
    const lines: string[] = [];
    lines.push(`${bazi.dayMaster}日主，坐${dayBranch}，${dayChangSheng}在婚姻宫。`);
    if (spouseAnalysis.totalCount > 0) {
      lines.push(`配偶星${spouseAnalysis.quality}（出现${spouseAnalysis.totalCount}次），缘分信号${spouseAnalysis.totalCount >= 2 ? "清晰" : "可辨"}。`);
    } else {
      lines.push("配偶星不显，缘分待大运流年引动。");
    }
    const he = branchInteractions.filter(i => i.type === "合" || i.type === "三合" || i.type === "半合");
    const chong = branchInteractions.filter(i => i.type === "冲");
    if (he.length > 0) lines.push(`日支与${he.map(i => i.target).join("、")}相合，婚姻宫有和谐基础。`);
    if (chong.length > 0) lines.push(`日支与${chong.map(i => i.target).join("、")}相冲，感情生活中需要应对外部变动。`);
    if (timing.currentYear) lines.push(`当前${timing.currentYear}年为引动窗口。`);
    return lines.join("");
  })();
  
  return {
    id, mode: "solo",
    headline: headlineMap[result.yuanType] ?? "姻缘深度解读",
    summary,
    createdAt: new Date().toISOString(),
    baziOverview, sections,
  };
}
```

- [ ] **Step 2: 运行编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 运行现有测试**

```bash
npx vitest run src/lib/marriage.test.ts
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "feat: 重写buildSoloDeepReport主函数

- 使用新的8节section builder替换旧的10节结构
- 数据流：calculateBazi → 共享分析 → 8个builder → 汇总
- 保留baziOverview用于报告页面的八字表格渲染

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: 构建双人版 Section Builder + 重写 buildPairDeepReport

**Files:**
- Modify: `src/lib/marriage-deep-report.ts`

- [ ] **Step 1: 构建第1节 — 双方命盘对照**

```typescript
function buildPairSection1_ChartComparison(
  a: BaziResult, b: BaziResult,
  inputs: { personA: { birthDate: string; birthHour: number; gender: string }; personB: { birthDate: string; birthHour: number; gender: string } },
): DeepReportSection {
  const aPillars = a.pillars, bPillars = b.pillars;
  
  const body = [
    "### 甲方命盘",
    `| 柱位 | 干支 | 纳音 | 十神 | 五行 | 空亡 |`,
    `|------|------|------|------|------|------|`,
    ...aPillars.map(p => `| ${p.label} | ${p.ganZhi} | ${p.nayin} | ${p.tenGod} | ${p.element} | ${p.xunKong} |`),
    "",
    `日主：${a.dayMaster} | 主导五行：${a.dominantElement} | 强弱：${a.strength} | 生肖：${a.zodiac} | 用神：${a.usefulElements.join("、") || "无显著偏颇"}`,
    "",
    "### 乙方命盘",
    `| 柱位 | 干支 | 纳音 | 十神 | 五行 | 空亡 |`,
    `|------|------|------|------|------|------|`,
    ...bPillars.map(p => `| ${p.label} | ${p.ganZhi} | ${p.nayin} | ${p.tenGod} | ${p.element} | ${p.xunKong} |`),
    "",
    `日主：${b.dayMaster} | 主导五行：${b.dominantElement} | 强弱：${b.strength} | 生肖：${b.zodiac} | 用神：${b.usefulElements.join("、") || "无显著偏颇"}`,
    "",
    "### 关键差异",
    generatePairComparisonSummary(a, b),
  ].join("\n");
  
  return {
    title: "双方命盘对照",
    subtitle: `${a.dayMaster}日主（${a.zodiac}）↔ ${b.dayMaster}日主（${b.zodiac}）`,
    body,
    highlights: [a.dayMaster, b.dayMaster, a.dominantElement, b.dominantElement, a.zodiac, b.zodiac],
  };
}

function generatePairComparisonSummary(a: BaziResult, b: BaziResult): string {
  const parts: string[] = [];
  
  // 五行对比
  const GENERATING: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
  const CONTROLLING: Record<string, string> = { "木": "土", "火": "金", "土": "水", "金": "木", "水": "火" };
  
  if (GENERATING[a.dominantElement] === b.dominantElement) {
    parts.push(`- 五行：甲方${a.dominantElement}生乙方${b.dominantElement}，甲方的能量天然滋养乙方。`);
  } else if (GENERATING[b.dominantElement] === a.dominantElement) {
    parts.push(`- 五行：乙方${b.dominantElement}生甲方${a.dominantElement}，乙方的能量天然滋养甲方。`);
  } else if (a.dominantElement === b.dominantElement) {
    parts.push(`- 五行：双方主导五行同为${a.dominantElement}，价值观趋同，默契度高。`);
  } else if (CONTROLLING[a.dominantElement] === b.dominantElement) {
    parts.push(`- 五行：甲方${a.dominantElement}克乙方${b.dominantElement}，甲方天然倾向于主导关系节奏。`);
  } else if (CONTROLLING[b.dominantElement] === a.dominantElement) {
    parts.push(`- 五行：乙方${b.dominantElement}克甲方${a.dominantElement}，乙方天然倾向于主导关系节奏。`);
  } else {
    parts.push(`- 五行：${a.dominantElement}与${b.dominantElement}无直接生克，关系中的能量互动更依赖后天磨合。`);
  }
  
  // 用神
  const sharedUseful = a.usefulElements.filter(e => b.usefulElements.includes(e));
  if (sharedUseful.length > 0) {
    parts.push(`- 用神：双方共有用神${sharedUseful.join("、")}，在人生方向上存在共同的"需要"。`);
  }
  
  // 生肖
  const zodiacGap = Math.abs(
    ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].indexOf(a.zodiac) -
    ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"].indexOf(b.zodiac)
  );
  if (zodiacGap === 4) {
    parts.push(`- 生肖：${a.zodiac}与${b.zodiac}为三合配对，传统婚配中的上佳组合。`);
  } else if (zodiacGap === 6) {
    parts.push(`- 生肖：${a.zodiac}与${b.zodiac}为六冲，需要更多耐心和智慧来经营。`);
  }
  
  return parts.join("\n");
}
```

- [ ] **Step 2: 构建第2节 — 日柱关系深度分析**

```typescript
function buildPairSection2_DayPillarDeep(
  aDayStem: string, bDayStem: string, aDayBranch: string, bDayBranch: string,
  aPillars: { ganZhi: string; label: string }[], bPillars: { ganZhi: string; label: string }[],
  aDayCs: string, bDayCs: string, aInB: string, bInA: string,
): DeepReportSection {
  const parts: string[] = [];
  const positiveStages = ["长生", "沐浴", "冠带", "临官", "帝旺"];
  
  // 1. 天干五合
  const TIAN_GAN_HE: Record<string, string> = {
    "甲": "己", "己": "甲", "乙": "庚", "庚": "乙", "丙": "辛", "辛": "丙",
    "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊",
  };
  const HE_RESULT: Record<string, string> = {
    "甲己": "土", "己甲": "土", "乙庚": "金", "庚乙": "金",
    "丙辛": "水", "辛丙": "水", "丁壬": "木", "壬丁": "木", "戊癸": "火", "癸戊": "火",
  };
  
  parts.push("### 天干五合");
  if (TIAN_GAN_HE[aDayStem] === bDayStem) {
    const result = HE_RESULT[aDayStem + bDayStem] ?? "";
    parts.push(`双方日干**${aDayStem}${bDayStem}为天干五合**，合化${result}。`);
    parts.push("天干五合是合盘中最重要的吉象——代表两人在核心价值观、人生方向和日常沟通中存在天然的吸引与默契。在传统子平法中，日干五合被视为'有情之合'，是长期关系最稳固的基石。");
  } else {
    parts.push(`双方日干${aDayStem}与${bDayStem}无合。天干无合不代表无缘——许多长久关系恰恰建立在彼此察觉差异、主动理解的基础上。天干无合时，关注地支关系更能看出日常相处的底色。`);
  }
  
  // 2. 地支关系
  parts.push("");
  parts.push("### 地支关系");
  
  const branchKey = aDayBranch + bDayBranch;
  const LIU_HE: Record<string, string> = {
    "子": "丑", "丑": "子", "寅": "亥", "亥": "寅", "卯": "戌", "戌": "卯",
    "辰": "酉", "酉": "辰", "巳": "申", "申": "巳", "午": "未", "未": "午",
  };
  const LIU_CHONG: Record<string, string> = {
    "子": "午", "午": "子", "丑": "未", "未": "丑", "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯", "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳",
  };
  const LIU_HAI: Record<string, string> = {
    "子": "未", "未": "子", "丑": "午", "午": "丑", "寅": "巳", "巳": "寅",
    "卯": "辰", "辰": "卯", "申": "亥", "亥": "申", "酉": "戌", "戌": "酉",
  };
  
  if (LIU_HE[aDayBranch] === bDayBranch) {
    parts.push(`日支${aDayBranch}${bDayBranch}为**地支六合**——双方在日常习惯、家庭节奏和生活方式上自然协调。六合是合婚中最受重视的地支关系，代表两个人在同一屋檐下不容易产生根本性摩擦，适合长期共同生活。`);
  } else if (LIU_CHONG[aDayBranch] === bDayBranch) {
    parts.push(`日支${aDayBranch}${bDayBranch}为**地支六冲**——两人在日常节奏和行事风格上有显著差异。冲不一定是坏事——它也能带来活力和新鲜感，但需要双方在沟通中保持耐心，避免将小摩擦升级为原则冲突。`);
  } else if (LIU_HAI[aDayBranch] === bDayBranch) {
    parts.push(`日支${aDayBranch}${bDayBranch}为**地支六害**——传统上认为这是一种暗中损耗的关系。表面平静，实际在细节上容易互相触痛。需要双方在边界感和情绪表达上多下功夫。`);
  } else {
    parts.push(`日支${aDayBranch}与${bDayBranch}无明显的合冲害关系，日常相处较为平和。两人可以保持各自的节奏和空间，适合在共同目标中逐步建立默契。`);
  }
  
  // 3. 日主在对方婚姻宫的状态
  parts.push("");
  parts.push("### 十二长生交互");
  parts.push(`甲方日主${aDayStem}在乙方日支${bDayBranch}：**${aInB}**${positiveStages.includes(aInB) ? "（正向——甲方在关系中感受舒适、能量充沛）" : "（收敛——甲方在关系中需要更多调适）"}`);
  parts.push(`乙方日主${bDayStem}在甲方日支${aDayBranch}：**${bInA}**${positiveStages.includes(bInA) ? "（正向——乙方在关系中感受舒适、能量充沛）" : "（收敛——乙方在关系中需要更多调适）"}`);
  
  if (positiveStages.includes(aInB) && positiveStages.includes(bInA)) {
    parts.push("双方在对方婚姻宫都处于上升阶段——相处时能量互相支持、彼此滋养，是较为理想的互动模式。");
  } else if (!positiveStages.includes(aInB) && !positiveStages.includes(bInA)) {
    parts.push("双方在对方婚姻宫都处于收敛阶段——关系中需要更多的理解和耐心。收敛不代表不好，而是意味着彼此需要时间来适应对方的节奏。");
  } else {
    parts.push("双方在对方婚姻宫的状态不完全同步。这不代表关系不好，而是需要认识到彼此的感受可能不同，并有意识地照顾对方的感受。");
  }
  
  return {
    title: "日柱关系深度分析",
    subtitle: `${aDayStem}${aDayBranch} ↔ ${bDayStem}${bDayBranch}`,
    body: parts.join("\n"),
    highlights: [
      TIAN_GAN_HE[aDayStem] === bDayStem ? "天干五合" : "天干无合",
      LIU_HE[aDayBranch] === bDayBranch ? "地支六合" : LIU_CHONG[aDayBranch] === bDayBranch ? "地支六冲" : "地支平和",
      `甲方→乙方：${aInB}`, `乙方→甲方：${bInA}`,
    ],
  };
}
```

- [ ] **Step 3: 构建第3-7节和附件**

第3节（五行交互与互补）、第4节（十神交叉配对）、第5节（神煞与特殊配置共振）、第6节（大运同步分析）、第7节（综合研判与相处建议）、第8节（附录）。

由于这些节的内容框架与设计文档一致，以下给出关键函数签名和实现要点：

```typescript
// 第3节：五行交互与互补
function buildPairSection3_ElementInteraction(
  a: BaziResult, b: BaziResult,
  aDominant: string, bDominant: string,
  nayinA: string, nayinB: string,
): DeepReportSection { /* 五行生克链 + 分布对比 + 纳音配对 + 用神互补 */ }

// 第4节：十神交叉配对
function buildPairSection4_TenGodCross(
  aPillars: { ganZhi: string; tenGod: string; hiddenTenGods: string[]; label: string }[],
  bPillars: { ganZhi: string; tenGod: string; hiddenTenGods: string[]; label: string }[],
  aSS: string[], bSS: string[],
): DeepReportSection { /* 保留现逻辑 + 增强解读 */ }

// 第5节：神煞与特殊配置共振
function buildPairSection5_ShenShaResonance(
  shenA: ShenShaItem[], shenB: ShenShaItem[],
  jiA: ShenShaItem[], jiB: ShenShaItem[],
  xiongA: ShenShaItem[], xiongB: ShenShaItem[],
  aDayPillar: string, bDayPillar: string,
): DeepReportSection { /* 神煞对照 + 特殊日柱配对 */ }

// 第6节：大运同步分析
function buildPairSection6_LuckSync(
  aLuck: BaziResult["luck"], bLuck: BaziResult["luck"],
  aDayBranch: string, bDayBranch: string,
  aSpouseStars: string[], bSpouseStars: string[],
): DeepReportSection { /* 双方大运并排对比 + 重合时段 */ }

// 第7节：综合研判与相处建议
function buildPairSection7_PairSynthesis(
  result: MarriageResult, crossTotal: number,
  mutualJi: ShenShaItem[], mutualXiong: ShenShaItem[],
  jiCount: number, cautionCount: number,
): DeepReportSection { /* 去伪评分，追溯式总结 */ }
```

- [ ] **Step 4: 重写 buildPairDeepReport 主函数**

```typescript
export function buildPairDeepReport(
  result: MarriageResult,
  inputs: { personA: { birthDate: string; birthHour: number; gender: string }; personB: { birthDate: string; birthHour: number; gender: string } },
): MarriageDeepReport {
  const id = nextId("mp");
  const a = calculateBazi(inputs.personA);
  const b = calculateBazi(inputs.personB);
  const aPillars = a.pillars, bPillars = b.pillars;
  
  const aDayStem = aPillars[2].ganZhi[0], bDayStem = bPillars[2].ganZhi[0];
  const aDayBranch = aPillars[2].ganZhi[1], bDayBranch = bPillars[2].ganZhi[1];
  const aDayCs = getChangShengStage(aDayStem, aDayBranch);
  const bDayCs = getChangShengStage(bDayStem, bDayBranch);
  const aInB = getChangShengStage(aDayStem, bDayBranch);
  const bInA = getChangShengStage(bDayStem, aDayBranch);
  
  // 神煞
  const shenA = computeShenSha(a.dayMaster, aPillars[0].ganZhi[1], aPillars);
  const shenB = computeShenSha(b.dayMaster, bPillars[0].ganZhi[1], bPillars);
  const { ji: jiA, xiong: xiongA } = shenShaSummary(shenA);
  const { ji: jiB, xiong: xiongB } = shenShaSummary(shenB);
  const mutualJi = jiA.filter(sa => jiB.some(sb => sb.name === sa.name));
  const mutualXiong = xiongA.filter(sa => xiongB.some(sb => sb.name === sa.name));
  
  // 配偶星
  const aSS = inputs.personA.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  const bSS = inputs.personB.gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];
  
  // 十神交叉计数
  const tenLabels = ["年柱", "月柱", "日柱", "时柱"];
  let crossTotal = 0;
  bPillars.forEach(p => { if (aSS.includes(p.tenGod)) crossTotal++; crossTotal += p.hiddenTenGods.filter(t => aSS.includes(t)).length; });
  aPillars.forEach(p => { if (bSS.includes(p.tenGod)) crossTotal++; crossTotal += p.hiddenTenGods.filter(t => bSS.includes(t)).length; });
  
  // 纳音
  const nayinA = aPillars[2].nayin, nayinB = bPillars[2].nayin;
  
  // Findings
  const allFindings = (result.dimensions ?? []).flatMap(d => d.findings);
  const jiCount = allFindings.filter(f => f.level === "合" || f.level === "吉").length;
  const cautionCount = allFindings.filter(f => f.level === "慎" || f.level === "冲").length;
  
  // 构建8个Section
  const sections: DeepReportSection[] = [
    buildPairSection1_ChartComparison(a, b, inputs),
    buildPairSection2_DayPillarDeep(aDayStem, bDayStem, aDayBranch, bDayBranch, aPillars, bPillars, aDayCs, bDayCs, aInB, bInA),
    buildPairSection3_ElementInteraction(a, b, a.dominantElement, b.dominantElement, nayinA, nayinB),
    buildPairSection4_TenGodCross(aPillars, bPillars, aSS, bSS),
    buildPairSection5_ShenShaResonance(shenA, shenB, jiA, jiB, xiongA, xiongB, aPillars[2].ganZhi, bPillars[2].ganZhi),
    buildPairSection6_LuckSync(a.luck, b.luck, aDayBranch, bDayBranch, aSS, bSS),
    buildPairSection7_PairSynthesis(result, crossTotal, mutualJi, mutualXiong, jiCount, cautionCount),
    buildSoloSection8_Appendix(), // 复用单人版附录
  ];
  
  // Headline
  const headlineMap: Record<string, string> = {
    "天赐良缘": "多维度高度契合", "互补良缘": "五行相生，关键维度和谐",
    "契合之缘": "多数维度协调", "成长之缘": "磨合中建立更深连结",
  };
  
  return {
    id, mode: "pair",
    headline: headlineMap[result.yuanType] ?? "合盘深度解读",
    summary: `${a.dayMaster}日主（${a.dominantElement}·${a.zodiac}）与 ${b.dayMaster}日主（${b.dominantElement}·${b.zodiac}），十神交叉${crossTotal}次呼应。`,
    createdAt: new Date().toISOString(),
    sections,
  };
}
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: 运行测试**

```bash
npx vitest run
```

- [ ] **Step 7: 提交**

```bash
git add src/lib/marriage-deep-report.ts
git commit -m "feat: 实现双人合盘深度报告8节section builder

- 第1节 双方命盘对照：并排四柱+关键差异标注
- 第2节 日柱关系深度分析：天干五合+地支关系+十二长生交互
- 第3节 五行交互与互补：生克链+分布对比+纳音+用神
- 第4节 十神交叉配对：配偶星呼应+比劫食伤互动
- 第5节 神煞与特殊配置共振
- 第6节 大运同步分析
- 第7节 综合研判与相处建议
- 第8节 附录（复用）

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: 端到端验证

**Files:**
- 验证: `src/lib/marriage-deep-report.ts`

- [ ] **Step 1: 运行完整测试套件**

```bash
npx vitest run
# Expected: all tests pass
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: 启动开发服务器验证**

```bash
npm run dev
# 访问 http://127.0.0.1:3000/marriage
# 输入测试数据，查看免费结果
# 点击"查看深度解读"，确认8节内容完整且无重复
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: 端到端验证通过

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 总结

| 指标 | 变更前 | 变更后 |
|------|--------|--------|
| 单人版章节数 | 10（3组重叠） | 8（无重叠） |
| 双人版章节数 | 5 | 8 |
| 伪评分系统 | 有（14分加权） | 移除 |
| 模板内容 | `elementRelationTraits` + `changShengDetailed` | 移除，改为数据驱动 |
| 神煞展示 | 20+颗全列 | 8-12颗高权重 |
| 流年分析 | 仅免费版有雏形 | 深度版逐详解 |
| 附录 | 无 | 新增 |
