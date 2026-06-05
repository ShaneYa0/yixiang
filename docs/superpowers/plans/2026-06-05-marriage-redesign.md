# 姻缘模块重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将姻缘模块从"评分+VIP花哨"改造为"缘型标签+全维度免费+深度详批CTA"，对齐八字模块的简洁专业风格。

**Architecture:** 数据层 `marriage.ts` 去掉score改yuanType，去掉VIP分层让timing/spousePortrait直接返回。展示层 `MarriageResult` 不再接收 `isVip`/`onSubscribe`，纯专业展示。页面层 `MarriagePage` 去掉VIP状态管理，流程简化为三态（输入→结果+解读→重新测算）。底部加 `MarriageDeepReportOffer` CTA。

**Tech Stack:** Next.js App Router, React, TypeScript

---

### Task 1: 改造 `src/lib/marriage.ts` — 去score改缘型、去VIP分层

**Files:**
- Modify: `src/lib/marriage.ts`

**What changes:**
- `MarriageResult.score` → `MarriageResult.yuanType`
- `SingleMarriageResult.score` → `SingleMarriageResult.yuanType`
- 各维度 `{ score: number, text: string }` → `{ text: string }`（去掉score）
- `timing` 和 `spousePortrait` 不再标"订阅"，全部直接返回
- `people` 和 `person` 增加 `dayMaster` 和 `zodiac` 字段

- [ ] **Step 1: 修改类型定义**

将现有的 `MarriageResult` 和 `SingleMarriageResult` 类型替换为：

```ts
export type MarriageResult = {
  yuanType: string;
  summary: string;
  details: Record<string, { text: string }>;
  people: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string }[];
};

export type SingleMarriageResult = {
  yuanType: string;
  summary: string;
  details: Record<string, { text: string }>;
  timing: { text: string; bestYears: number[] };
  spousePortrait: { text: string; element: ElementName };
  person: { name: string; dominantElement: ElementName; dayMaster: string; zodiac: string };
};
```

同时删除 `SingleMarriageInput` 中不再需要的类型（已与 `PersonInput` 重复的定义保留，实际只在计算函数中用）。

- [ ] **Step 2: 改造双人合婚 — 维度分析函数改为纯文本**

将各 `scoreXxx()` 函数改为返回 `{ text: string }`，内部计算"吉/平/慎"但只体现在文字中：

```ts
/** 日柱天干五合分析 */
function analyzeDayStemHarmony(dayStemA: string, dayStemB: string): string {
  const key = dayStemA + dayStemB;
  const harmony = heavenlyStemHarmony[key];
  if (harmony) {
    return `日柱天干${dayStemA}${dayStemB}为天干五合，化${harmony}，此为合婚中最重要的吉象之一。天干五合代表两人在核心价值观、人生方向和日常沟通中有天然的吸引与默契，不以激情为驱动，而以理解和认同为根基。`;
  }
  return `日柱天干${dayStemA}${dayStemB}无合，两人在沟通中需要更多有意识的磨合。但无合不代表无缘，许多长久关系恰恰建立在彼此察觉差异、主动理解的基础上。天干无合时，关注地支关系更能看出日常相处的底色。`;
}

/** 日柱地支关系分析 */
function analyzeDayBranchRelation(dayBranchA: string, dayBranchB: string): string {
  const key = dayBranchA + dayBranchB;
  if (earthlyBranchHarmony[key]) {
    return `日支${dayBranchA}${dayBranchB}为地支六合，主双方在生活习惯、家庭节奏和日常相处中自然协调。六合是合婚中最受重视的地支关系，代表两个人在同一屋檐下不容易产生根本性的摩擦，适合长期共同生活。`;
  }
  if (earthlyBranchClash.has(key)) {
    return `日支${dayBranchA}${dayBranchB}为地支六冲，主两人在日常节奏和行事风格上有显著差异。冲不一定是坏事——它也能带来活力和新鲜感，但需要双方在沟通中保持耐心，避免将小摩擦升级为原则冲突。`;
  }
  if (earthlyBranchHarm.has(key)) {
    return `日支${dayBranchA}${dayBranchB}为地支六害，传统上认为这是一种暗中损耗的关系——表面平静，实际在细节上容易互相触痛。需要双方在边界感和情绪表达上多下功夫。`;
  }
  return `日支无明显的合冲害关系，属于平和配置。两人在日常生活中可以保持各自的节奏和空间，适合在共同目标中逐步建立默契。`;
}

/** 五行互补分析 */
function analyzeWuxing(dominantA: ElementName, dominantB: ElementName): string {
  if (generating[dominantA] === dominantB) {
    return `${dominantA}生${dominantB}：命主A的主导五行生扶命主B，A在关系中倾向于给予支持、提供情绪价值和行动力，B则在被滋养中获得成长。这种结构下A像是关系的"发动机"，需要注意不过度付出。`;
  }
  if (generating[dominantB] === dominantA) {
    return `${dominantB}生${dominantA}：命主B的主导五行生扶命主A，B在关系中扮演支持者的角色。A在关系中感受到滋养和安全感，适合长期发展。`;
  }
  if (dominantA === dominantB) {
    return `两人主导五行同为${dominantA}，性格底色相近，价值观容易一致，相处舒服自然。但同类五行也意味着在压力和冲突时可能缺少互补的缓冲——一个急另一个也急。适合在有共同目标的框架下经营。`;
  }
  if (controlling[dominantA] === dominantB) {
    return `${dominantA}克${dominantB}：命主A的主导五行克制B，关系中A可能天然处于主导位置，B则可能有被压制的感觉。这种配置需要在权力感和表达空间上做出有意识的平衡。`;
  }
  if (controlling[dominantB] === dominantA) {
    return `${dominantB}克${dominantA}：命主B的主导五行克制A，关系中B可能更具主导性。这种配置下A需要确保自己的声音被听到，B需要注意尊重对方的边界。`;
  }
  return `两人五行关系平和，不形成明显的生克链条。适合在共同经历中培养默契，五行互补的作用会随大运流年的变化而浮动。`;
}

/** 纳音气质分析 */
function analyzeNayin(nayinA: string, nayinB: string): string {
  const lastCharA = nayinA[nayinA.length - 1];
  const lastCharB = nayinB[nayinB.length - 1];
  if (lastCharA === lastCharB) {
    return `日柱纳音分别为${nayinA}与${nayinB}，同属${lastCharA}气。纳音反映一个人内在的气韵和生命节奏，同气意味着两人在直觉层面容易共振，不需要太多解释就能理解对方的情绪底色。`;
  }
  if (
    (lastCharA === "金" && lastCharB === "水") || (lastCharA === "水" && lastCharB === "金") ||
    (lastCharA === "木" && lastCharB === "火") || (lastCharA === "火" && lastCharB === "木") ||
    (lastCharA === "火" && lastCharB === "土") || (lastCharA === "土" && lastCharB === "火") ||
    (lastCharA === "土" && lastCharB === "金") || (lastCharA === "金" && lastCharB === "土")
  ) {
    return `日柱纳音${nayinA}与${nayinB}呈相生之势，一方的内在节奏自然滋养另一方。纳音不像天干地支那样显性，它是一种更底层的"气场契合"，让两人在无声处有共鸣。`;
  }
  return `日柱纳音${nayinA}与${nayinB}各有其韵。纳音不同不代表不合，而是两人的内在节奏各有侧重——一个可能偏快一个偏慢，在理解彼此节奏差异的基础上相处反而更有层次。`;
}

/** 生肖匹配分析 */
function analyzeShengxiao(zodiacA: string, zodiacB: string): string {
  const zodiacIndex = (z: string) => ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"].indexOf(z);
  const za = zodiacIndex(zodiacA);
  const zb = zodiacIndex(zodiacB);
  const gap = Math.abs(za - zb);
  if (gap === 4) {
    return `生肖${zodiacA}与${zodiacB}间距为三合配对（差4位），在传统婚配中属于上佳组合。三合生肖在生活节奏、家庭观念和长期规划上容易同步，这种默契往往超越了语言层面的沟通。`;
  }
  if (gap === 6) {
    return `生肖${zodiacA}与${zodiacB}为六冲（差6位），传统观念中视为需要更多耐心和智慧来经营的关系。冲代表动力和变化，不一定导致分离——很多六冲夫妻恰恰在不断的调适中建立了更深的连结。关键是双方是否愿意在冲突中学习而非逃避。`;
  }
  if (gap === 0) {
    return `两人同为${zodiacA}生肖，性格底色有天然的相似性，容易在人生阶段和心理节奏上同步。同生肖组合在传统中视为中等偏吉，优势在于互相理解，需注意的是在相似的压力点面前都缺少缓冲。`;
  }
  return `生肖${zodiacA}与${zodiacB}无冲无合，在传统中属于平缘。生肖只是合婚的一个参考维度，日柱关系和五行互补的重要性远大于此。`;
}

/** 大运同步分析 */
function analyzeLuckSync(
  a: ReturnType<typeof calculateBazi>,
  b: ReturnType<typeof calculateBazi>
): string {
  const cycleA = a.luck.currentCycle;
  const cycleB = b.luck.currentCycle;

  if (!cycleA || !cycleB) {
    return "一方或双方尚未起运，大运同步度的参考有限。建议更多关注当下相处的感受和沟通质量，而非命理层面的阶段匹配。";
  }

  const rel = generating[cycleA.element] === cycleB.element
    ? "相生"
    : generating[cycleB.element] === cycleA.element
      ? "相生"
      : cycleA.element === cycleB.element
        ? "相同"
        : controlling[cycleA.element] === cycleB.element || controlling[cycleB.element] === cycleA.element
          ? "相克"
          : "平和";

  if (rel === "相生") {
    return `双方当前大运${cycleA.ganZhi}（${cycleA.startAge}-${cycleA.endAge}岁）与${cycleB.ganZhi}（${cycleB.startAge}-${cycleB.endAge}岁）呈相生之势，人生阶段的节奏比较合拍。一方的运势走向自然支持另一方的发展方向，适合一起做长期规划和重要决策。`;
  }
  if (rel === "相同") {
    return `双方大运五行同为${cycleA.element}，步调相近。默契不错，但也要注意避免同质化带来的疲倦——两个人都处于相似的能量阶段，可能同时激进或同时消沉，需要有意识地在关系中保持不同的视角。`;
  }
  if (rel === "相克") {
    return `当前大运阶段张力较大：${cycleA.ganZhi}与${cycleB.ganZhi}五行相克。一方可能在事业冲刺或人生转型期，另一方则在沉淀或调整阶段。建议各自给彼此更多空间和理解，不强求在每个节点都同步。`;
  }
  return `大运阶段各有侧重，${cycleA.ganZhi}与${cycleB.ganZhi}的关系不形成明显的生克冲合。理解和沟通是让节奏互补的关键。`;
}

/** 财官互动分析 */
function analyzeCaiGuan(
  a: ReturnType<typeof calculateBazi>,
  b: ReturnType<typeof calculateBazi>
): string {
  const husbandStars = ["正官", "七杀"];
  const wifeStars = ["正财", "偏财"];

  const maleChart = a.gender === "male" ? a : b.gender === "male" ? b : null;
  const femaleChart = a.gender === "female" ? a : b.gender === "female" ? b : null;

  if (!maleChart || !femaleChart) {
    return "双方性别相同，财官互动维度参考有限。建议更多从五行互补和日柱关系看两人的配合模式。同性别伴侣关系在传统命理框架外，但五行生克和日柱合冲的维度仍然适用。";
  }

  let interactions = 0;
  const findings: string[] = [];

  for (const p of femaleChart.pillars) {
    if (wifeStars.includes(p.tenGod)) {
      interactions++;
      findings.push(`男方财星（${p.tenGod}）出现在女方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => wifeStars.includes(t))) {
      interactions++;
    }
  }

  for (const p of maleChart.pillars) {
    if (husbandStars.includes(p.tenGod)) {
      interactions++;
      findings.push(`女方官星（${p.tenGod}）出现在男方${p.label}`);
    }
    if (p.hiddenTenGods.some((t) => husbandStars.includes(t))) {
      interactions++;
    }
  }

  if (interactions >= 3) {
    return `${findings.slice(0, 2).join("；")}。双方的配偶星在对方命盘中出现多次，这是传统合婚中最为看重的信号之一——代表彼此的性别能量有天然的呼应和引力，缘分根基深厚。`;
  }
  if (interactions >= 1) {
    return `${findings[0]}。配偶星在对方盘中有所呼应，有一定程度的缘分牵引，但不够密集。这意味着两人的吸引可能更依赖于后天的相处和共同成长，而非先天的命理结构。`;
  }
  return "双方配偶星未在对方盘中明显显现。这不代表无缘——许多幸福的婚姻中，配偶星互动并不密集。它意味着这段关系更多地建立在现实相处、共同经历和自主选择的基础上，而非命理层面的先天牵引。";
}
```

- [ ] **Step 3: 改造 `calculateMarriage` — 去score改缘型判定**

删除现有函数中 `scoreDayStemHarmony`、`scoreDayBranchRelation`、`scoreDayElementRelation`、`scoreNayinRelation`、`scoreWuxing`、`scoreLuckSync`、`scoreCaiGuan` 这些返回分数的函数。替换为 Step 2 中的纯文本分析函数。

在 `calculateMarriage` 中，用条件判断确定 `yuanType`，收集各维度分析文本：

```ts
export function calculateMarriage(personA: PersonInput, personB: PersonInput): MarriageResult {
  const a = calculateBazi(personA);
  const b = calculateBazi(personB);

  const dayStemA = a.pillars[2].ganZhi[0];
  const dayStemB = b.pillars[2].ganZhi[0];
  const dayBranchA = a.pillars[2].ganZhi[1];
  const dayBranchB = b.pillars[2].ganZhi[1];

  // 各维度纯文本分析
  const rizhuText = [
    analyzeDayStemHarmony(dayStemA, dayStemB),
    analyzeDayBranchRelation(dayBranchA, dayBranchB),
  ].join("\n\n");

  const wuxingText = analyzeWuxing(a.dominantElement, b.dominantElement);
  const nayinText = analyzeNayin(a.pillars[2].nayin, b.pillars[2].nayin);
  const shengxiaoText = analyzeShengxiao(a.zodiac, b.zodiac);
  const dayunText = analyzeLuckSync(a, b);
  const caiguanText = analyzeCaiGuan(a, b);

  // 缘型判定：基于日柱合、五行生、生肖合三个核心维度
  const dayStemHarmonized = heavenlyStemHarmony[dayStemA + dayStemB];
  const dayBranchHarmonized = earthlyBranchHarmony[dayBranchA + dayBranchB];
  const dayBranchClashed = earthlyBranchClash.has(dayBranchA + dayBranchB);
  const dayBranchHarmed = earthlyBranchHarm.has(dayBranchA + dayBranchB);
  const wuxingGenerating = generating[a.dominantElement] === b.dominantElement
    || generating[b.dominantElement] === a.dominantElement;
  const wuxingControlling = controlling[a.dominantElement] === b.dominantElement
    || controlling[b.dominantElement] === a.dominantElement;

  const zodiacIndex = (z: string) => ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"].indexOf(z);
  const zodiacGap = Math.abs(zodiacIndex(a.zodiac) - zodiacIndex(b.zodiac));
  const zodiacTriple = zodiacGap === 4;
  const zodiacClash = zodiacGap === 6;

  let yuanType: string;
  if (dayStemHarmonized && wuxingGenerating && zodiacTriple) {
    yuanType = "天赐良缘";
  } else if (wuxingGenerating && (dayStemHarmonized || dayBranchHarmonized || zodiacTriple)) {
    yuanType = "互补良缘";
  } else if (dayBranchClashed || dayBranchHarmed || wuxingControlling) {
    yuanType = "成长之缘";
  } else {
    yuanType = "契合之缘";
  }

  // Summary 按缘型生成
  const summaries: Record<string, string> = {
    "天赐良缘": "日柱天干五合有情，五行相生有助，生肖三合有应。各方面高度契合，这种配置在传统合婚中极为难得。建议在感情中保持真诚与珍惜，顺其自然地发展，不必刻意用力。",
    "互补良缘": "五行有相生之势，关键维度多有和谐。两人在相处中能互相补充对方所缺，适合共同经营长期关系。优势在于"不同而和"——各自的特质恰好是对方所需要的力量。",
    "契合之缘": "多数维度协调中性，有一定的合拍基础。关系是否能深入发展，更多取决于双方的意愿和现实经营而非命理结构。适合在共同目标和日常相处中逐步建立信任。",
    "成长之缘": "命理层面存在冲害或五行制衡，传统观念中需要更多耐心和智慧来经营。但张力也是成长的机会——如果双方都愿意在关系里学习和调整，这种配置反而可能带来更深层的连结。",
  };

  return {
    yuanType,
    summary: summaries[yuanType],
    details: {
      rizhu: { text: rizhuText },
      wuxing: { text: wuxingText },
      nayin: { text: nayinText },
      shengxiao: { text: shengxiaoText },
      dayun: { text: dayunText },
      caiguan: { text: caiguanText },
    },
    people: [
      { name: personA.name || "甲方", dominantElement: a.dominantElement, dayMaster: a.dayMaster, zodiac: a.zodiac },
      { name: personB.name || "乙方", dominantElement: b.dominantElement, dayMaster: b.dayMaster, zodiac: b.zodiac },
    ],
  };
}
```

- [ ] **Step 4: 改造 `calculateSingleMarriage` — 去score改缘型、timing/spousePortrait 直接返回**

同理改造单人姻缘，将分数函数转为纯文本，缘型判定，timing 和 spousePortrait 不再标"订阅"直接返回：

```ts
export function calculateSingleMarriage(input: SingleMarriageInput): SingleMarriageResult {
  const bazi = calculateBazi(input);
  const { pillars, dominantElement, zodiac, gender } = bazi;
  const dayPillar = pillars[2];
  const dayBranch = dayPillar.ganZhi[1];

  const spouseStars = gender === "male" ? ["正财", "偏财"] : ["正官", "七杀"];

  // ---- 1. 婚姻宫分析 ----
  const palaceParts: string[] = [];
  const palaceIssues: string[] = [];
  const palaceGood: string[] = [];
  let hasPalaceIssue = false;

  const otherBranches = pillars.filter((_, i) => i !== 2).map((p) => p.ganZhi[1]);
  for (const branch of otherBranches) {
    const key = dayBranch + branch;
    if (earthlyBranchClash.has(key)) {
      hasPalaceIssue = true;
      palaceIssues.push(`${dayBranch}${branch}六冲，婚姻宫受冲，感情中易有外部变动或内部情绪波动`);
    }
    if (earthlyBranchHarm.has(key)) {
      hasPalaceIssue = true;
      palaceIssues.push(`${dayBranch}${branch}六害，婚姻宫有暗损之象，需在相处中注意细节摩擦`);
    }
    if (earthlyBranchHarmony[key]) {
      palaceGood.push(`${dayBranch}${branch}六合，婚姻宫得合，关系根基稳固`);
    }
  }

  if (branchHasStar(dayPillar.hiddenTenGods, spouseStars)) {
    palaceGood.push("配偶星藏于日支，正缘得位，婚姻根基扎实");
  }

  palaceParts.push(`日支为${dayBranch}，属${dayPillar.element}，此为配偶宫所在。`);
  if (palaceGood.length > 0) palaceParts.push(palaceGood.join("。"));
  if (palaceIssues.length > 0) palaceParts.push(palaceIssues.join("。"));

  const palaceText = palaceParts.join("\n");

  // ---- 2. 配偶星分析 ----
  const starParts: string[] = [];
  let stemCount = 0;
  let branchCount = 0;
  let hasStarClear = false;

  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    if (stemHasStar(p.tenGod, spouseStars)) {
      stemCount++;
      starParts.push(`${p.label}天干透出${p.tenGod}`);
      hasStarClear = true;
    }
    if (branchHasStar(p.hiddenTenGods, spouseStars)) {
      branchCount++;
    }
  }

  if (stemCount >= 2) {
    starParts.push("配偶星双透干，异性缘旺，正缘信号明显，感情经历可能较为丰富。需注意在多个选择中保持清醒。");
  } else if (stemCount === 1) {
    starParts.push("配偶星透干一位，正缘清晰，感情目标明确。传统上认为一星透干是最佳配置——不多不少，方向明确。");
  } else if (branchCount > 0) {
    starParts.push("配偶星藏于地支而未透干，缘分稍隐，需耐心等待时机或大运流年的引动。不代表没有好姻缘，只是节奏偏缓。");
  } else {
    starParts.push("配偶星在原局不显，姻缘需要更多主动社交和大运流年的引动。不必焦虑——很多晚婚的命局恰恰在合适的大运阶段遇到了最好的缘分。");
  }

  if (branchHasStar(dayPillar.hiddenTenGods, spouseStars)) {
    starParts.push("配偶星坐日支（配偶宫），此为"正星坐正位"，婚后关系稳定，配偶得力。");
  }

  const starText = starParts.join("\n");

  // ---- 3. 桃花运分析 ----
  const romanceParts: string[] = [];
  const peachBranch = peachBlossomMap[dayBranch] ?? peachBlossomMap[zodiacToBranch(zodiac)];
  let peachCount = 0;
  const peachPillars: string[] = [];

  for (const p of pillars) {
    if (p.ganZhi[1] === peachBranch) {
      peachCount++;
      peachPillars.push(p.label);
    }
  }

  if (peachCount >= 2) {
    romanceParts.push(`桃花星${peachBranch}在${peachPillars.join("、")}出现${peachCount}次，异性缘较旺，感情机遇多。但桃花多也意味着需要更多定力来专注于一段关系。`);
  } else if (peachCount === 1) {
    romanceParts.push(`桃花星${peachBranch}在${peachPillars[0]}出现，有适度的吸引力和感情机遇，不会过多也不至缺失。`);
  } else {
    romanceParts.push(`桃花星${peachBranch}未在四柱中显现，感情发展偏理性克制，不太容易一见钟情。适合通过共同兴趣和长期相处来培养感情。`);
  }

  const peachPillar = pillars.find((p) => p.ganZhi[1] === peachBranch);
  if (peachPillar && (stemHasStar(peachPillar.tenGod, spouseStars) || branchHasStar(peachPillar.hiddenTenGods, spouseStars))) {
    romanceParts.push("桃花与配偶星同柱，这是极佳的信号——感情机遇容易导向稳定关系，而非短暂的激情。");
  }

  for (const p of pillars) {
    const key = peachBranch + p.ganZhi[1];
    if (earthlyBranchClash.has(key)) {
      romanceParts.push(`桃花星${peachBranch}被冲，感情机遇有反复之象。可能遇到合适的人但时机不对，或感情刚有苗头就遭遇外部变动。建议在感情初期保持耐心，不急于下结论。`);
      break;
    }
  }

  const romanceText = romanceParts.join("\n");

  // ---- 缘型判定 ----
  const hasClearSpouseStar = stemCount >= 1;
  const hasSolidPalace = palaceGood.length > 0 && palaceIssues.length === 0;
  const hasPeachInPosition = peachCount >= 1 &&
    !!(peachPillar && (stemHasStar(peachPillar.tenGod, spouseStars) || branchHasStar(peachPillar.hiddenTenGods, spouseStars)));

  let yuanType: string;
  if (hasClearSpouseStar && hasSolidPalace && hasPeachInPosition) {
    yuanType = "正缘明朗";
  } else if (hasClearSpouseStar && !hasPalaceIssue) {
    yuanType = "佳期可期";
  } else if (stemCount === 0 && branchCount > 0) {
    yuanType = "缘待时机";
  } else {
    yuanType = "水到渠成";
  }

  const summaries: Record<string, string> = {
    "正缘明朗": "配偶星透干有力，婚姻宫稳固无冲，桃花星得位，各方面信号清晰。不必过于急切——好的缘分会在合适的时机自然出现，保持开放的心态即可。",
    "佳期可期": "配偶星有显现，婚姻宫尚稳，姻缘的基础不错。可关注大运流年引动配偶星或合日支的年份，那些时间窗口往往带来关键的缘分转折。",
    "缘待时机": "配偶星藏支未透，缘分需要更多耐心等待大运或流年的引动。在等待的过程中，做好自己、积累自己，往往比焦虑于"何时遇到"更有意义。",
    "水到渠成": "配偶星不显但婚姻宫无冲无破，属于顺其自然型。这类配置往往通过朋友介绍、工作环境或长期相处发展出感情，而非闪电式的浪漫。过程虽缓，但根基稳。",
  };

  // ---- Timing ----
  const timing = computeMarriageTiming(bazi, spouseStars, peachBranch);

  // ---- Spouse Portrait ----
  const spousePortrait = computeSpousePortrait(bazi, spouseStars);

  return {
    yuanType,
    summary: summaries[yuanType],
    details: {
      marriagePalace: { text: palaceText },
      spouseStar: { text: starText },
      romanceLuck: { text: romanceText },
    },
    timing,
    spousePortrait,
    person: {
      name: input.name || "命主",
      dominantElement,
      dayMaster: bazi.dayMaster,
      zodiac: bazi.zodiac,
    },
  };
}
```

- [ ] **Step 5: 删除旧的分数函数**

删除以下不再使用的函数：
- `scoreDayStemHarmony`
- `scoreDayBranchRelation`
- `scoreDayElementRelation`
- `scoreNayinRelation`
- `scoreWuxing`
- `scoreLuckSync`
- `scoreCaiGuan`
- `analyzeStrength`（如果只在此文件中定义）

- [ ] **Step 6: 运行现有测试，修复类型错误**

```bash
npx vitest run
```

预期：如果有 `marriage.test.ts` 中的测试引用了旧的 `score` 字段或函数签名，需更新测试。如果没有专门测试，则确保 TypeScript 编译无错误：

```bash
npx tsc --noEmit
```

- [ ] **Step 7: 提交**

```bash
git add src/lib/marriage.ts
git commit -m "refactor: 姻缘去评分改缘型，去VIP分层，全维度纯文本分析" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 重写 `src/lib/templates/marriage.ts` — 扩充专业解读

**Files:**
- Modify: `src/lib/templates/marriage.ts`

- [ ] **Step 1: 重写 `getMarriageFreeReading`**

从3句傀儡文本改为按缘型+维度生成4-5段结构化专业解读：

```ts
import type { MarriageResult, SingleMarriageResult } from "@/lib/marriage";

export function getMarriageFreeReading(
  result: MarriageResult | SingleMarriageResult
): string {
  // 单人姻缘
  if ("person" in result && !("people" in result)) {
    return getSoloReading(result as SingleMarriageResult);
  }
  // 双人合婚
  return getPairReading(result as MarriageResult);
}

function getPairReading(r: MarriageResult): string {
  const [a, b] = r.people;

  const yuanTypeInsight: Record<string, string> = {
    "天赐良缘": "双方在日柱天干、五行生克和生肖三个核心维度上均呈现吉象，这种配置在传统合婚中极为少见。以下从六个维度展开分析，帮助你理解这段关系的深层结构。",
    "互补良缘": "五行相生之势让这段关系天然具备"补其所缺"的潜力。互补型关系的优势在于，各自擅长的领域恰好是对方需要的支撑。以下从各维度展开。",
    "契合之缘": "多数维度中性偏吉，关系的发展更依赖于后天的经营而非先天的命理推动。这是一种需要时间来浮现其深度的缘分类型。以下为各维度详解。",
    "成长之缘": "命理层面存在张力，但张力也是关系的催化剂。传统合婚不否定冲害配置——很多经历冲害磨合的关系，最终反而比一路平顺的关系更稳固。以下为各维度详解。",
  };

  return [
    `此合婚命盘判定为"${r.yuanType}"。${yuanTypeInsight[r.yuanType] ?? ""}`,
    `双方日主：${a.name || "甲方"}为${a.dayMaster}（${a.dominantElement}），${b.name || "乙方"}为${b.dayMaster}（${b.dominantElement}）。生肖：${a.zodiac}与${b.zodiac}。${r.summary}`,
    `日柱匹配维度——${r.details.rizhu?.text ?? ""}`,
    `五行互补维度——${r.details.wuxing?.text ?? ""}`,
    `纳音气质维度——${r.details.nayin?.text ?? ""}`,
    `生肖匹配维度——${r.details.shengxiao?.text ?? ""}`,
    `大运同步维度——${r.details.dayun?.text ?? ""}`,
    `财官互动维度——${r.details.caiguan?.text ?? ""}`,
    "以上为合婚命盘的全维度解读。合婚看的是先天结构的匹配度，但每一段关系最终的走向，取决于两个人的意愿、沟通和共同成长。命理分析提供的是理解彼此的框架，而非对关系的定论。",
  ].join("\n\n");
}

function getSoloReading(r: SingleMarriageResult): string {
  const yuanTypeInsight: Record<string, string> = {
    "正缘明朗": "配偶星、婚姻宫、桃花位三个维度均呈吉象，先天姻缘结构清晰。以下从婚姻宫、配偶星、桃花运、正缘时机和配偶画像五个维度展开分析。",
    "佳期可期": "配偶星有所显现，婚姻宫基本稳固。在合适的时机到来之前，做好自己往往是最好的准备。以下为各维度详解。",
    "缘待时机": "配偶星偏隐，姻缘需要大运流年的引动。不必焦虑——很多在30岁以后才遇到正缘的命局，恰恰在最合适的人生阶段走进了婚姻。以下为各维度详解。",
    "水到渠成": "配偶星不显但无冲害，属于顺其自然发展型。这类配置的缘分往往来自日常生活和工作环境，而非戏剧化的浪漫。以下为各维度详解。",
  };

  return [
    `此命盘姻缘判定为"${r.yuanType}"。${yuanTypeInsight[r.yuanType] ?? ""}`,
    `命主日主为${r.person.dayMaster}（${r.person.dominantElement}），生肖${r.person.zodiac}。${r.summary}`,
    `婚姻宫维度——${r.details.marriagePalace?.text ?? ""}`,
    `配偶星维度——${r.details.spouseStar?.text ?? ""}`,
    `桃花运维度——${r.details.romanceLuck?.text ?? ""}`,
    `正缘时机——${r.timing?.text ?? ""}`,
    `配偶画像——${r.spousePortrait?.text ?? ""}五行属性：${r.spousePortrait?.element ?? "未知"}。`,
    "姻缘分析看的是先天结构和趋势，但不是宿命。命理框架提供的是理解自己的工具——了解自己的感情模式、需求和节奏，比任何预测都更有价值。",
  ].join("\n\n");
}
```

- [ ] **Step 2: 确保编译通过**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/templates/marriage.ts
git commit -m "refactor: 姻缘解读模板从3句扩充为多维度专业分析" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 更新 `src/app/api/marriage/route.ts` — 去订阅引导文字

**Files:**
- Modify: `src/app/api/marriage/route.ts`

- [ ] **Step 1: 去掉模板中的订阅引导**

当前 `getMarriageFreeReading` 返回的文本末尾包含"订阅后可解锁..."。Task 2 重写后模板已无订阅引导，但需确认 API 路由本身不额外拼接订阅文字。读取当前路由，如果没有任何额外的订阅文字拼接，此步骤只需确认即可。

- [ ] **Step 2: 提交**

```bash
git add src/app/api/marriage/route.ts
git commit -m "refactor: 姻缘API去订阅引导文字" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> 如果 API 路由在当前条件下无需修改，跳过此 Task 的提交。

---

### Task 4: 重写 `src/components/marriage/MarriageResult.tsx` — 纯专业展示

**Files:**
- Modify: `src/components/marriage/MarriageResult.tsx`

- [ ] **Step 1: 重写 MarriageResult — 双人合婚展示**

去掉 `isVip`、`onSubscribe` props，去掉所有VIP特效和锁区。全维度纯展示：

```tsx
"use client";

import type { MarriageResult as PairResult, SingleMarriageResult as SoloResult } from "@/lib/marriage";
import { Card } from "@/components/ui/Card";
import { PillarCard } from "@/components/ui/PillarCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

const pairLabels: Record<string, string> = {
  rizhu: "日柱匹配",
  wuxing: "五行互补",
  nayin: "纳音气质",
  shengxiao: "生肖匹配",
  dayun: "大运同步",
  caiguan: "财官互动",
};

const soloLabels: Record<string, string> = {
  marriagePalace: "婚姻宫",
  spouseStar: "配偶星",
  romanceLuck: "桃花运",
};

const pairDimensionKeys = ["rizhu", "wuxing", "nayin", "shengxiao", "dayun", "caiguan"];
const soloDimensionKeys = ["marriagePalace", "spouseStar", "romanceLuck"];

type Props = {
  mode: "pair" | "solo";
  result: PairResult | SoloResult;
};

export function MarriageResult({ mode, result }: Props) {
  if (mode === "solo") {
    const r = result as SoloResult;
    return (
      <div className="space-y-5 pt-8">
        {/* 总览 */}
        <Card>
          <div className="text-center">
            <div className="text-2xl font-light tracking-[0.2em] text-ink dark:text-paper">
              {r.yuanType}
            </div>
            <div className="mt-3 grid gap-1 text-[13px] leading-7 text-ink-light sm:grid-cols-3">
              <span>日主：{r.person.dayMaster}</span>
              <span>五行：{r.person.dominantElement}</span>
              <span>生肖：{r.person.zodiac}</span>
            </div>
            <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
          </div>
        </Card>

        {/* 维度卡片 */}
        <div className="grid gap-4 sm:grid-cols-3">
          {soloDimensionKeys.map((key) => {
            const detail = (r.details as Record<string, { text: string }>)[key];
            if (!detail) return null;
            return (
              <Card key={key}>
                <SectionTitle>{soloLabels[key]}</SectionTitle>
                <div className="mt-2 whitespace-pre-line text-[13px] leading-7 text-ink-light">
                  {detail.text}
                </div>
              </Card>
            );
          })}
        </div>

        {/* 正缘时机 */}
        {r.timing && (
          <Card>
            <SectionTitle>正缘时机</SectionTitle>
            <p className="mt-2 text-[13px] leading-7 text-ink-light">{r.timing.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.timing.bestYears.map((y) => (
                <span key={y} className="border border-divider px-2 py-1 text-[11px] text-ink-light">
                  {y} 年
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* 配偶画像 */}
        {r.spousePortrait && (
          <Card>
            <SectionTitle>配偶画像</SectionTitle>
            <p className="mt-2 text-[13px] leading-7 text-ink-light">{r.spousePortrait.text}</p>
            <div className="mt-2 text-[11px] text-ink-fade">五行属性：{r.spousePortrait.element}</div>
          </Card>
        )}
      </div>
    );
  }

  // ---- Pair mode ----
  const r = result as PairResult;
  const [personA, personB] = r.people;

  return (
    <div className="space-y-5 pt-8">
      {/* 总览 */}
      <Card>
        <div className="text-center">
          <div className="text-2xl font-light tracking-[0.2em] text-ink dark:text-paper">
            {r.yuanType}
          </div>
          <div className="mt-3 grid gap-1 text-[13px] leading-7 text-ink-light sm:grid-cols-2">
            <span>{personA.name || "甲方"}：日主{personA.dayMaster} · {personA.dominantElement} · 肖{personA.zodiac}</span>
            <span>{personB.name || "乙方"}：日主{personB.dayMaster} · {personB.dominantElement} · 肖{personB.zodiac}</span>
          </div>
          <p className="mt-4 text-[13px] leading-7 text-ink-light">{r.summary}</p>
        </div>
      </Card>

      {/* 维度卡片 2x3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pairDimensionKeys.map((key) => {
          const detail = (r.details as Record<string, { text: string }>)[key];
          if (!detail) return null;
          return (
            <Card key={key}>
              <SectionTitle>{pairLabels[key]}</SectionTitle>
              <div className="mt-2 whitespace-pre-line text-[13px] leading-7 text-ink-light">
                {detail.text}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 确保编译通过**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add src/components/marriage/MarriageResult.tsx
git commit -m "refactor: 姻缘结果组件重写 — 去评分/VIP特效/锁区，纯专业展示" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 新增 `src/components/marriage/MarriageReading.tsx`

**Files:**
- Create: `src/components/marriage/MarriageReading.tsx`

- [ ] **Step 1: 创建 MarriageReading 组件**

对齐 `BaziReading` 的简洁风格：

```tsx
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function MarriageReading({ reading, mode }: { reading: string; mode: "pair" | "solo" }) {
  return (
    <Card>
      <SectionTitle>{mode === "pair" ? "合婚解读" : "姻缘解读"}</SectionTitle>
      <div className="whitespace-pre-line text-[13px] leading-7 text-ink-light">{reading}</div>
    </Card>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/marriage/MarriageReading.tsx
git commit -m "feat: 新增 MarriageReading 组件，对齐 BaziReading 风格" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: 新增 `src/components/marriage/MarriageDeepReportOffer.tsx`

**Files:**
- Create: `src/components/marriage/MarriageDeepReportOffer.tsx`

- [ ] **Step 1: 创建 MarriageDeepReportOffer 组件**

对齐 `BaziDeepReportOffer` 的结构。由于深度详批生成逻辑后续迭代，先做展示层CTA（点击后跳 `/me` 或显示"即将推出"）：

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const modules = ["合婚格局详解", "日柱深度分析", "大运同步推演", "财官互动精解", "相处模式建议", "关键年份提醒"];
const deliverables = [
  { value: "深度详批", label: "完整解读", note: "比基础合婚看得更深更细" },
  { value: "命盘图解", label: "重点清晰", note: "双方四柱、五行、十神对比呈现" },
  { value: "阶段指引", label: "大运流年", note: "看清不同阶段的相处重点" },
  { value: "长期保存", label: "随时复看", note: "登录后可回到我的查看" },
];

export function MarriageDeepReportOffer({
  mode,
}: {
  mode: "pair" | "solo";
}) {
  const title = mode === "pair" ? "合婚深度详批" : "姻缘深度详批";

  return (
    <Card className="border-ink/40 bg-card">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <h3 className="mb-4 text-3xl font-thin leading-tight tracking-[0.12em] text-ink sm:text-4xl">
            {mode === "pair"
              ? "把两人的命理连结讲透，也把相处的节奏讲明白"
              : "把姻缘的来龙去脉讲清，也把等待的节奏讲明白"}
          </h3>
          <p className="max-w-2xl text-[13px] leading-7 text-ink-light">
            {mode === "pair"
              ? "免费版继续保留六维度合婚分析和缘型判定。深度详批会把日柱关系、大运同步、财官互动和相处建议进一步展开，结合双方完整的四柱八字做交叉解读，适合保存后反复查看。"
              : "免费版继续保留婚姻宫、配偶星、桃花运分析和缘型判定。深度详批会将正缘时机、配偶画像和关键大运阶段进一步展开，结合完整四柱八字做深入解读，适合保存后反复查看。"}
          </p>
          <div className="mt-6 border-l border-ink pl-4">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-ink">
              {mode === "pair" ? "本次合婚核心" : "本次姻缘核心"}
            </div>
            <p className="text-[13px] leading-7 text-ink-light">
              深度详批在免费解读的基础上，进一步结合双方十神配置、大运流年的同步度和关键时间节点，给出更具体的相处建议和阶段预判。
            </p>
          </div>
        </div>

        <div className="border border-ink bg-paper p-5 dark:bg-card">
          <div className="mb-4">
            <div className="mb-1 text-[11px] tracking-[0.14em] text-ink-fade">登录后即可查看</div>
            <div className="text-[13px] leading-6 text-ink-light">
              深度详批功能即将推出，敬请期待
            </div>
          </div>
          <Link
            href="/me"
            className="inline-flex w-full min-h-11 items-center justify-center border border-ink px-7 py-3 text-sm font-medium tracking-[0.14em] text-ink transition-colors hover:bg-divider/40 dark:border-paper dark:text-paper dark:hover:bg-paper/10"
          >
            查看我的账户
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {deliverables.map((item) => (
          <div key={item.label} className="border border-divider bg-paper/50 p-4 dark:bg-card/50">
            <div className="mb-1 text-xl font-thin text-ink dark:text-paper">{item.value}</div>
            <div className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-ink">{item.label}</div>
            <div className="text-[11px] leading-5 text-ink-fade">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 border border-divider bg-paper/40 p-4 dark:bg-card/40">
        <div className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-ink">深度详批内容</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {modules.map((m) => (
            <div key={m} className="border border-divider px-3 py-2 text-center text-[11px] tracking-[0.12em] text-ink-light">
              {m}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/marriage/MarriageDeepReportOffer.tsx
git commit -m "feat: 新增 MarriageDeepReportOffer 深度详批CTA组件" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: 重写 `src/app/marriage/page.tsx` — 去VIP状态管理

**Files:**
- Modify: `src/app/marriage/page.tsx`

- [ ] **Step 1: 重写 MarriagePage**

去掉所有VIP相关状态和逻辑，对齐 BaziPage：

```tsx
"use client";

import { useState } from "react";
import { MarriageInput, type MarriageFormData } from "@/components/marriage/MarriageInput";
import { MarriageResult } from "@/components/marriage/MarriageResult";
import { MarriageReading } from "@/components/marriage/MarriageReading";
import { MarriageDeepReportOffer } from "@/components/marriage/MarriageDeepReportOffer";
import type { MarriageResult as MarriageResultData, SingleMarriageResult } from "@/lib/marriage";

type MarriageApiResponse = {
  mode: "pair" | "solo";
  result: MarriageResultData | SingleMarriageResult;
  reading: string;
};

export default function MarriagePage() {
  const [result, setResult] = useState<MarriageApiResponse | null>(null);
  const [lastInput, setLastInput] = useState<MarriageFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: MarriageFormData) => {
    setLoading(true);
    setLastInput(data);
    const response = await fetch("/api/marriage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setResult(await response.json());
    setLoading(false);
  };

  if (!result) return <MarriageInput onSubmit={submit} loading={loading} />;

  return (
    <div className="space-y-5">
      <MarriageResult mode={result.mode} result={result.result} />
      <MarriageReading reading={result.reading} mode={result.mode} />
      {lastInput && <MarriageDeepReportOffer mode={result.mode} />}
      <button
        onClick={() => setResult(null)}
        className="mx-auto block text-[11px] tracking-[0.15em] text-ink-fade hover:text-ink dark:hover:text-paper"
      >
        重新测算
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 确保编译通过并检查引用**

```bash
npx tsc --noEmit
```

检查不再使用的 imports 是否全部移除（`SubscriptionGuide`、`useEffect`、`useCallback`）。

- [ ] **Step 3: 提交**

```bash
git add src/app/marriage/page.tsx
git commit -m "refactor: 姻缘页面去VIP状态管理，对齐BaziPage简洁结构" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: 全局验证

- [ ] **Step 1: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

预期：无类型错误。

- [ ] **Step 2: 运行测试**

```bash
npx vitest run
```

预期：现有测试通过，或有因类型变化导致的测试更新。

- [ ] **Step 3: 构建检查**

```bash
npx next build
```

预期：构建成功，无引用错误。

- [ ] **Step 4: 提交验证修复（如有）**

```bash
git add -A
git commit -m "fix: 姻缘重设计后的类型和引用修复" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 文件结构总结

```
src/
├── app/
│   ├── api/marriage/route.ts          [小改] 去订阅引导
│   └── marriage/page.tsx              [重写] 去VIP状态
├── components/marriage/
│   ├── MarriageInput.tsx              [不变]
│   ├── MarriageResult.tsx             [重写] 纯专业展示
│   ├── MarriageReading.tsx            [新增] 解读卡片
│   └── MarriageDeepReportOffer.tsx    [新增] 深度详批CTA
└── lib/
    ├── marriage.ts                    [重写] 去score改缘型
    └── templates/marriage.ts          [重写] 专业解读
```
