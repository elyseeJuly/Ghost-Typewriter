# 幽灵打字机 (Ghost Typewriter) — stop-slop 深度集成与反 AI 检测升级技术规格书
> **文档号**: SPEC_20260611_STOP_SLOP_INTEGRATION_AND_ANTI_DETECTION_UPGRADE  
> **项目版本**: V10.0-PRO-ANTI-DETECTION  
> **生效日期**: 2026-06-11  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/emberois-dev-standards/specifications/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 📖 一、 审计背景与核心结论

基于最新的防检测机制技术审计报告（[AUDIT_20260611_GHOST_TYPEWRITER_ANTI_DETECTION_AUDIT.md](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/AUDIT_20260611_GHOST_TYPEWRITER_ANTI_DETECTION_AUDIT.md)），目前系统内置的 8 项防检测手段（如多重翻译、错别字/标点注射、静态敏感词本地判别、时间戳伪造等）面对现代深度学习检测器（如 GPTZero, Originality.ai 等）时已基本失效。

### 1. 为什么传统防检测手段不太有效？

*   **维度不对等（高维统计 vs 表面噪声）**：错别字（Typo Injector）、标点暴走（Punctuation Chaos）或时间戳伪造（Temporal Forge）仅在文本表面制造噪点。现代 AI 检测器在提取特征前，会通过**文本清洗与归一化（Text Normalization）**直接滤除这些噪声。检测器评估的是核心词法序列的 **N-gram 滑动窗口概率**，表面噪声无法撼动其全局判定。
*   **重写逻辑未脱离 LLM 概率舒适区（Babel Translation Chain / Extreme Scramble）**：无论经过多少次语系互译，最后一步的中文输出依然由 LLM（如 Gemini）基于其条件概率生成。没有强制约束 of LLM 生成的文本具有极高的统计学预测性，困惑度（Perplexity）极低，极易被识别。
*   **均质性特征未被破坏（Burstiness / Rhythm 缺失）**：AI 写作具有高度的结构均质性，句长分布平缓，句式对称。单纯打乱句式（如 Extreme Scramble）虽然降低了逻辑连贯性，但在局部词组搭配概率上依然是典型的 LLM 统计模式，且破坏了人类可读性。
*   **本地判别器流于表面（Local Heuristic Discriminator）**：原本地判别器仅使用一张包含不足 30 个词的静态表及简单的句长方差计算，而外部检测器使用百亿参数级深度神经网络。这给系统提供了虚假的安全感。

### 2. 开源项目 stop-slop 的启示

`stop-slop`（https://github.com/hardikpandya/stop-slop）是一套专为 AI 写作定制的质量提升与腔调剔除规格书。它并非检测工具，而是一套**主动预防性提示词架构与规则集**。它揭示了 AI 写作的本质缺陷（AI Slop）：
*   **喉部清理句式（Throat-clearing）**：AI 惯用的宏大叙事开篇（如 "In today's fast-paced digital era...", "值得注意的是..."）。
*   **商业/技术黑话与虚词**：过度使用 `delve`、`tapestry`、`赋能`、`闭环`、`底层逻辑` 等空洞高维概率词。
*   **公式化结构**：频繁的“既 A 又 B”对比（Seesaw Sentences）、排比三联律、以及负向列表。
*   **节奏均质化**：缺乏长短句交错的动态节奏。

通过将 `stop-slop` 的核心原则与 Ghost Typewriter 的对抗生成管线相结合，我们能够将单纯的“格式投毒”升级为对 **“高维概率分布破坏”** 与 **“细粒度 AI 腔调切除”** 的主动干预。

---

## 🛠️ 二、 stop-slop 与本项目的深度融合方案

我们将 `stop-slop` 引入 V10.0 重构规划，从 **LLM 生成级约束**、**本地特征判别器**、以及 **X-Ray 三色透析编辑器** 三大模块进行深度融合与重构。

```
                         Ghost Typewriter & stop-slop 融合架构
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
     【LLM 级控制层】                【本地判别评分层】               【协同交互层】
    (src/lib/gemini.ts)        (src/lib/discriminator.ts)        (src/lib/xray.ts)
   1. 动态注入 Banned List     1. 基于 stop-slop 规则扫描       1. 升级为“五色透析”
   2. 强制长短句变奏/PPL扰动    2. 五维评估法 (50分制)           2. 一键建议词库切除
   3. 零 AI 废话提示词模板       3. 动态 N-gram 滑动余弦拟合       3. 高亮套路与虚词
```

### 1. LLM 生成级控制层重构：[gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts)

在调用 Gemini API 的 `systemInstruction` 和生成参数中，强制植入 `stop-slop` 核心控制。

*   **AI 词汇黑名单硬阻断**：
    将 `stop-slop` 的 `references/phrases.md` 汉化并扩充为中英双语禁用词表，直接作为 LLM 的强制 System Instruction 规则：
    ```typescript
    const BANNED_AI_WORDS_ZH = [
      "值得注意的是", "底层逻辑", "赋能", "闭环", "脱颖而出", "画卷", 
      "蓝图", "格局", "显而易见", "毫无疑问", "深入探讨", "不得不提", "众所周知"
    ];
    const BANNED_AI_WORDS_EN = [
      "delve", "tapestry", "beacon", "testament", "synergy", "vibrant", 
      "leverage", "navigate the complexities", "deep dive", "circle back"
    ];
    ```
*   **结构与节奏变奏干扰（PPL & Burstiness 物理微调）**：
    在 prompt 中注入具体的语法结构强约束：
    1.  **句长不均度**：强制相邻句子的长度差必须大于 10 个字符；每 3 句话中必须包含 1 句 5 个字以内的极短句。
    2.  **禁用排比**：严禁连续出现三个结构相同的短语或排比句，强制降维为双项或单项陈述。
    3.  **零喉部清理**：禁止任何陈述之前的铺垫（Announcements），所有段落首句必须是高信息密度的直接断言。

---

### 2. 本地判别评分层升级：[discriminator.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts)

废弃无用的 30 词敏感词打分，将本地评估函数 `heuristicAIScore` 重构为基于 `stop-slop` 五维打分机制的轻量级特征评估器。

```typescript
export interface StopSlopMetrics {
  directness: number;    // 直截了当度：评估有无喉部清理和虚词
  rhythm: number;        // 节奏变奏度：句长方差与对称性惩罚
  trust: number;         // 可信度：评估形容词/夸张虚词堆砌
  authenticity: number;  // 真实感：细节密度
  density: number;       // 信息密度：评估 adverbs 与重复同义词
  overallScore: number;  // 50分制总分，低于35分判定为 AI Slop
}

export function evaluateStopSlop(text: string): StopSlopMetrics {
  // 详见后文规格实现代码
}
```

*   **直截了当 (Directness)**：计算段落首句中“Announcement phrases”及过渡虚词的密度。
*   **节奏感 (Rhythm)**：计算句子长度的标准差 $\sigma$，若 $\sigma < 8$ 或存在连续对称句式结构，则给予大幅扣分。
*   **信息密度 (Density)**：统计副词（adverbs）和无意义形容词在总词数中的占比。

---

### 3. X-Ray 协同层升级：[xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts)

将原有的三色光谱扫描升级为符合 `stop-slop` 规范的 **“五色透析光谱（Pentachrome Spectrum）”**：

| 颜色 (Color) | 扫描属性 | 匹配对象与示例 | 建议操作 |
| :--- | :--- | :--- | :--- |
| **红色 (Red)** | **AI Clichés (套话)** | `底层逻辑`、`赋能`、`闭环`、`delve`、`tapestry` | 一键替换同义词 |
| **蓝色 (Blue)** | **Transitions & Hedges (机械避险)** | `值得注意的是`、`一般来说`、`也就是说` | 切除/删除该前缀 |
| **黄色 (Yellow)**| **Formulaic Structures (套路结构)** | 并列排比、Seesaw 对称句（`不仅...而且...`） | 结构重组，化繁为简 |
| **紫色 (Purple)**| **Throat-clearing (喉部清理)** | 首句垫词（`随着时代的不断发展...`） | 直接截断，首句直奔主题 |
| **橙色 (Orange)**| **Vague Words (空泛修饰)** | `极大地`、`深深地`、`完美地`、`absolutely` | 切除副词 |

通过提供一键“排毒”按钮，将 AI 腔调词和套路结构以直观的五色高亮呈现在前端编辑器中，辅助用户在本地进行极高效率的手工修正，彻底洗白 AI 特征。

---

## 💻 三、 核心代码规格定义

### 1. 本地 stop-slop 评估器接口定义 (`src/lib/discriminator.ts`)

```typescript
/**
 * 基于 stop-slop 规则集的本地 AI 腔调评估引擎
 */
export interface StopSlopReport {
  metrics: {
    directness: number;   // 1-10
    rhythm: number;       // 1-10
    trust: number;        // 1-10
    authenticity: number; // 1-10
    density: number;      // 1-10
  };
  score: number;          // 50分制总分 (低于35分不予通过)
  bannedMatches: Array<{
    phrase: string;
    type: 'filler' | 'structure' | 'adverb' | 'jargon';
    index: number;
  }>;
  suggestions: string[];
}

export function analyzeStopSlop(text: string): StopSlopReport {
  // 1. 初始化指标
  let directness = 10;
  let rhythm = 10;
  let trust = 10;
  let authenticity = 8; // 默认基准
  let density = 10;
  
  const bannedMatches: Array<{ phrase: string; type: 'filler' | 'structure' | 'adverb' | 'jargon'; index: number }> = [];
  const suggestions: string[] = [];

  // 2. 检测喉部清理与过渡虚词 (Directness)
  const throatClearing = [
    /值得注意的是/g, /正如我们所知/g, /不得不提的是/g, /显而易见的是/g,
    /in today's/gi, /it is important to note/gi, /here's the thing/gi
  ];
  let throatMatches = 0;
  throatClearing.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      throatMatches += matches.length;
      matches.forEach(m => {
        bannedMatches.push({ phrase: m, type: 'filler', index: text.indexOf(m) });
      });
    }
  });
  directness = Math.max(1, 10 - throatMatches * 2);
  if (throatMatches > 0) {
    suggestions.push(`检测到 ${throatMatches} 处喉部清理/废话垫句，建议直接删除首部废话直奔主题。`);
  }

  // 3. 检测句长节奏变奏 (Rhythm)
  // 分句：中文标点(。！？)或英文(.!?)
  const sentences = text.split(/[。！？\.!\?]/).map(s => s.trim()).filter(s => s.length > 0);
  if (sentences.length > 1) {
    const lengths = sentences.map(s => s.length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // 如果句子长度标准差过小，说明句长极度均质，判定为 AI 腔调
    if (stdDev < 8) {
      rhythm = Math.max(1, Math.round(stdDev * 1.2));
      suggestions.push("句子长度过于均一，缺乏高低起伏的语感节奏。建议混入短句或合并为复杂长句。");
    } else {
      rhythm = Math.min(10, Math.round(stdDev * 0.8) + 2);
    }
  } else {
    rhythm = 5; // 单句无法判断节奏
  }

  // 4. 统计空泛词与副词密度 (Density & Trust)
  const adverbs = [
    /极大地/g, /深深地/g, /完美地/g, /彻底地/g, /非常/g,
    /really/gi, /literally/gi, /absolutely/gi, /deeply/gi
  ];
  let adverbCount = 0;
  adverbs.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      adverbCount += matches.length;
      matches.forEach(m => {
        bannedMatches.push({ phrase: m, type: 'adverb', index: text.indexOf(m) });
      });
    }
  });
  density = Math.max(1, 10 - adverbCount * 1.5);
  if (adverbCount > 0) {
    suggestions.push(`修饰词/副词密度偏高 (${adverbCount}处)。建议切除无意义的程度修饰，提高句子骨架硬度。`);
  }

  // 5. AI 特征黑话 (Trust)
  const jargon = [
    /底层逻辑/g, /赋能/g, /闭环/g, /脱颖而出/g, /落地生根/g, /拥抱变化/g,
    /delve/gi, /tapestry/gi, /synergy/gi, /leverage/gi
  ];
  let jargonCount = 0;
  jargon.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      jargonCount += matches.length;
      matches.forEach(m => {
        bannedMatches.push({ phrase: m, type: 'jargon', index: text.indexOf(m) });
      });
    }
  });
  trust = Math.max(1, 10 - jargonCount * 2);
  if (jargonCount > 0) {
    suggestions.push(`包含 AI 特征词汇（如"底层逻辑"、"delve"等）。建议替换为具体通俗的代称。`);
  }

  // 计算综合总分
  const score = directness + rhythm + trust + authenticity + density;

  return {
    metrics: { directness, rhythm, trust, authenticity, density },
    score,
    bannedMatches,
    suggestions
  };
}
```

### 2. 五色透析高亮定义规格 (`src/lib/xray.ts`)

```typescript
export interface HighlightSpan {
  start: number;
  end: number;
  text: string;
  type: 'cliche' | 'transition' | 'structure' | 'throat' | 'adverb';
  color: string; // hex
  suggestion: string;
}

export function scanPentachromeSpectrum(text: string): HighlightSpan[] {
  const spans: HighlightSpan[] = [];
  
  const rules = [
    {
      regex: /底层逻辑|赋能|闭环|脱颖而出|画卷|蓝图|格局|delve|tapestry|synergy/gi,
      type: 'cliche' as const,
      color: '#FF6B6B', // 红色
      suggestion: 'AI特征套话，请更换为更直白、具体的人类表达词。'
    },
    {
      regex: /值得注意的是|不得不提的是|显而易见的是|一般来说|也就是说/g,
      type: 'transition' as const,
      color: '#4DABF7', // 蓝色
      suggestion: '机械过渡词与避险性开头，建议直接删除。'
    },
    {
      regex: /不仅[\s\S]*?而且|既[\s\S]*?又|不单[\s\S]*?还/g,
      type: 'structure' as const,
      color: '#FCC419', // 黄色
      suggestion: '公式化对称句式，建议拆分为节奏各异的非对称句。'
    },
    {
      regex: /随着[\s\S]*?的发展|在当今[\s\S]*?时代|众所周知/g,
      type: 'throat' as const,
      color: '#B197FC', // 紫色
      suggestion: '喉部清理垫词，建议直接剪切，首句直切主题。'
    },
    {
      regex: /极大地|深深地|完美地|彻底地|非常|really|literally|absolutely/gi,
      type: 'adverb' as const,
      color: '#FF922B', // 橙色
      suggestion: '修饰副词，建议直接删除以提升句子硬度与信息密度。'
    }
  ];

  rules.forEach(rule => {
    let match;
    const regex = new RegExp(rule.regex);
    while ((match = regex.exec(text)) !== null) {
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        type: rule.type,
        color: rule.color,
        suggestion: rule.suggestion
      });
      // 避免正则无限循环
      if (!regex.global) break;
    }
  });

  return spans.sort((a, b) => a.start - b.start);
}
```

---

## 📅 四、 实施路径与集成任务清单

为确保 V10 版本的稳定交付，我们将重构方案分解为以下两阶段实施方案：

### 阶段一：重构核心库与策略（2026-06-12 ~ 2026-06-15）
1.  **更新依赖与词库**：引入并注册 `stop-slop` 完整的 phrase 和 structure 词汇文件到项目 `src/config/stop-slop/`。
2.  **重构 LLM 驱动**：修改 [gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts)，在 `runBabelProtocol` 及 `runAdversarialCluster` 中内置 `stop-slop` 强约束指令模板。
3.  **移植评估引擎**：用 `evaluateStopSlop` 全面替换 [discriminator.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts) 中的本地静态启发打分逻辑。

### 阶段二：升级交互层与透析视窗（2026-06-16 ~ 2026-06-18）
1.  **升级 X-Ray 编辑器**：在 [xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts) 中应用五色光谱逻辑。
2.  **联调前端 UI**：前端编辑器组件接入五色高亮渲染，并为每处匹配词增加“一键删除”或“一键替换”的可交互悬浮提示框。
3.  **基准回归测试**：将重构后的输出投入 GPTZero 与 Originality.ai API，验证 AI 检测率是否显著下降至安全区（< 15% 判定概率）。
