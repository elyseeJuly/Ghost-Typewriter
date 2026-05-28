# 幽灵打字机 (Ghost Typewriter) — Hybrid Detox Edition 产品规格与技术白皮书
> **类别**: Specifications (规格说明与设计系统)  
> **版本号**: V8.0-HYBRID-DETOX (Hybrid Detox Edition)  
> **生效日期**: 2026-04-14  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 📖 一、 产品定位与核心理念

在生成式人工智能（AIGC）爆发的时代，AI 文本检测器（如 GPTZero、Originality.ai、CopyLeaks 等）通过检测文本的“困惑度 (Perplexity)”与“突发性 (Burstiness)”以及特定的语法树特征，能够极高概率地拦截 AI 自动生成的文本。

**幽灵打字机 (Ghost Typewriter) — Hybrid Detox Edition** 是业界首款集**“机器自动化降维”**与**“人机协同排毒”**于一体的反 AI 文本检测系统。

### 🏷️ 核心理念
重炮轰炸与精准手术的完美结合：
> “用自动化矩阵摧毁大面积机器语法树，用 X 光光谱透析机指引人类切除顽固的机械骨架。”

---

## 🛑 二、 核心反检测技术原理 (Anti-Detection Measures)

系统不依赖单一混淆手段，而是从“物理/词法层”、“语义/统计层”到“人机交互层”打出一套高维组合拳：

### 1. 第一防线：词法与物理层投毒 (Lexical & Physical Poisoning)
直接在分词器 (Tokenizer) 级别进行物理级拦截，破坏词频分布：
*   **错别字注入 (Typo Injection)**：利用专门的错别字映射脚本，将文本中极高频的无实际语义词汇（如“的/得/地”、“在/再”、“做/作”）根据上下文概率强行替换为同音错别字。
    *   *原理*：AI 生成模型通常在经过极度清洗的高质量语料上训练，极少产生此类低级物理错别字。适度注入此类噪音可瞬间拉低检测器的统计置信度。
*   **标点破缺 (Punctuation Chaos)**：随机将常规标点（如句号 `。`）替换为特定符号组合（如连用感叹号 `!!` 或省略号 `...`）。
    *   *原理*：破坏段落句法树的规整度，扰乱检测器对句长方差（Burstiness）的计算。

### 2. 第二防线：统计与语义层重组 — Protocol Babel (多重链式翻译)
针对 AI 写作特有的规整语法树和过度平滑的词语搭配进行语义重塑：
*   **链式翻译逻辑**：
    $$\Large \texttt{中文} \longrightarrow \texttt{德文} \longrightarrow \texttt{日文} \longrightarrow \texttt{中文}$$
*   **技术机制**：
    - 使用四步串行 LLM API 调用。
    - **中文 $\to$ 德文**：利用德语极其严密的语法逻辑重组句式骨架。
    - **德文 $\to$ 日文**：利用日语特有的委婉及倒装特征彻底打乱词序和介词搭配。
    - **日文 $\to$ 中文**：重新译回中文，自然生成不带有常规 AI 写作腔调的本土化重构文本。
    - *原理*：彻底洗去大模型生成文本中常见的词语共现概率（Co-occurrence Probability），从根本上重组句法树。

### 3. 第三防线：人机协同排毒 — X-Ray 扫描与光谱透析 (Detoxification)
自动化降维只能摧毁大面积特征，对于顽固的 AI 逻辑骨架，必须由人类进行“外科手术式”切除。
*   **光谱透析引擎**：通过实时正则过滤与词典检索，对编辑器内的文本执行三色光谱渲染：
    *   <span style="color:#ef4444; font-weight:bold;">红色 (Cliches)</span>：AI 高频套话与陈词滥调（例如：“总而言之”、“众所周知”、“如前所述”）。
    *   <span style="color:#3b82f6; font-weight:bold;">蓝色 (Transitions)</span>：平滑过渡词与逻辑连词（例如：“不仅如此”、“与此同时”、“然而”）。
    *   <span style="color:#eab308; font-weight:bold;">黄色 (Structures)</span>：具有机械对称美感和特征的句式结构（例如：“不仅...而且...”、“一方面...另一方面...”）。
*   **透析编辑器**：提供富文本 `contenteditable` 界面，让用户在光谱的清晰指引下，手动替换或重写被标记的高亮区域，消灭“AI 腔调”。

---

## 🎨 三、 双阶段流水线架构设计 (Two-Stage Pipeline)

系统整体采用严密的双阶段线性流水线设计，确立清晰的数据隔离和单向流动关系：

```
+--------------------------------------------------------+
|                      STAGE 1                           |
|  Draft Input (原始草稿)                                |
|     |                                                  |
|     v [Mutation Matrix]                                |
|  - Protocol Babel (多步链式翻译)                         |
|  - Typo Injector (前端错字注入)                         |
|  - Punctuation Chaos (标点符号混乱)                     |
+--------------------------------------------------------+
                           │
                           ▼ (一键注入)
+--------------------------------------------------------+
|                      STAGE 2                           |
|  Mutated Buffer (只读缓存)                              |
|     │                                                  |
|     ▼                                                  |
|  Detox Editor (可编辑透析台)                           |
|     ├─ [X-Ray Scanning Engine]                         |
|     │     ├─ 红: 高频套话 (Cliches)                     |
|     │     ├─ 蓝: 平滑连词 (Transitions)                 |
|     │     └─ 黄: 对称排比 (Structures)                  |
|     ├─ [粘贴纯文本拦截]                                 |
|     ├─ [实时字数与特征词计数器]                           |
|     └─ [人工二次润色与切除]                              |
+--------------------------------------------------------+
                           │
                           ▼ (一键复制)
                    Clean Export Text
```

### 1. 界面三栏式响应布局
系统主页面分为三栏布局，各栏分工极为明确：
*   **左栏：Control Panel (控制面板)**
    - 提供突变矩阵 (MUTATION MATRIX) 物理开关（Babel Protocol、Typo Injector、Punctuation Chaos）。
    - 物理投毒强度滑块（Intensity Slider, 0-100）。
    - 主执行按钮：`⚡ EXECUTE MUTATION`。
    - X-Ray 图例展示。
*   **中栏：Input & Buffer Panel (输入与缓存区)**
    - 上半部分：原始文本输入区域。
    - 下半部分：Stage 1 突变完成后的 `Mutated Buffer`（只读，带绿色黑客终端流出打字机动画，提供“注入透析台”按钮）。
*   **右栏：Detox Editor (透析编辑器)**
    - 阶段二核心交互界面。包含 `contenteditable` 的富文本透析区域。
    - 顶部包含实时特征词扫描计数器看板。
    - 底部包含 `RUN X-RAY SCAN` 及 `COPY CLEAN TEXT` 等操作按钮。

---

## 🛠️ 四、 AI 开发者核心实现规范 (AI Coder Directives)

为确保系统运行稳定性与扩展的优美性，后续维护与迭代必须严格遵守以下实现规范：

> [!IMPORTANT]
> **API 请求的指数退避与重试**
> 由于 `Protocol Babel` 需要串行进行 4 次 API 请求，任何一步出错都将导致整条流水线崩溃。
> 开发者必须在 [gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts) 中对每一次 API 调用包裹**指数退避（Exponential Backoff）重试机制**（基础等待 1s，倍数 2，最大重试 3 次）。并且在前端展示明确的中间状态（如："Babel Stage 1/3 Complete"）。

> [!IMPORTANT]
> **光标位置保护与 DOM 安全**
> X-Ray 扫描高亮引擎在将文本替换为带 `<span class="xray-xxx">` 的富 HTML 后，会完全重建 `contenteditable` 内的 DOM 树，这会导致用户的光标输入焦点丢失。
> 必须实现可靠的光标重定位机制：每次高亮重绘后，若用户当前处于聚焦状态，应自动将光标移至编辑区最末尾，以防阻断用户的连贯输入体验。

> [!WARNING]
> **剪贴板与粘贴安全拦截**
> `contenteditable` 默认会保留粘贴内容的富文本格式，从而引入外来杂乱的 HTML 标签，破坏 X-Ray 渲染树。
> 必须在 `DetoxEditor` 的 `onPaste` 事件上进行强力拦截，强制使用 `e.clipboardData.getData('text/plain')` 过滤，确保流入透析台的永远是 100% 干净的纯文本。
