# 幽灵打字机 (Ghost Typewriter) — 现存防检测机制技术审计报告
> **文档号**: AUDIT_20260611_GHOST_TYPEWRITER_ANTI_DETECTION_AUDIT  
> **项目版本**: V9.0-ADVERSARIAL-GAN  
> **生成日期**: 2026-06-11  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/emberois-dev-standards/specifications/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 📖 一、 审计执行摘要 (Executive Summary)

本审计报告对 **幽灵打字机 (Ghost Typewriter) V9.0-ADVERSARIAL-GAN** 系统中内置的所有反 AI 检测（Anti-AI Detection）机制进行了深度剖析与实测评估，并结合最新的 AI 检测技术分析（2025-2026）和开源 `stop-slop` 规范进行了对标。

> [!WARNING]
> **核心审计结论**
> 幽灵打字机目前内置的各种混淆方法**均无法顺利通过现代 AI 检测**。现代检测器（如 GPTZero、Originality.ai、Turnitin 等）是通过计算高维 Token 序列的概率分布（Perplexity & Burstiness）来判断的，而非简单的表面特征。系统目前依赖的“多国语言翻译链”和“字符投毒”在预处理和统计分析面前会直接失效。

---

## 🛠️ 二、 现存防检测机制深度剖析与代码审计

系统目前通过以下模块（主要位于 `src/lib/` 下）实现反检测，其具体代码细节与失效机理如下：

### 1. injectors.ts — 物理层投毒 (Physical Layer Poisoning)
*   **代码锚定**：[injectors.ts:L74-145](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/injectors.ts#L74-L145)
*   **技术机制**：
    *   `injectTypos`：基于硬编码的同音字字典（`TYPO_MAP_ZH`，如 的→地/得、在→再、做→作、他→她等约 15 组对；以及英文 `TYPO_MAP_EN`），按设定强度随机替换字符。
    *   `injectPunctuationChaos`（代码中为 `injectPunctuation`）：将常规中文标点替换为 Unicode 视觉相似字符（如 `，` → `⸒`、`。` → `᙮`、`！` → `ǃ`、`？` → `⸮`），并随机在句间插入省略号碎片（`..`, `...`）。
*   **失效机理**：
    1. **文本归一化（Text Normalization）**：现代 AI 检测器在分析前会先进行预处理，自动纠正明显的 typo 并将异形标点归一化为标准标点。
    2. **不改变统计轮廓**：局部零散的字符替换完全无法动摇整句、整段的 token 条件概率分布。

### 2. mutations.ts — 突变调度器 (Mutation Orchestrator)
*   **代码锚定**：[mutations.ts:L104-113](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/mutations.ts#L104-L113) 里的 `getRandomMutations` 及前端调用逻辑。
*   **技术机制**：作为 Stage 1 管道的指挥中心，根据配置调度 `babelEnabled`（巴别塔翻译）、`typoEnabled`（错字注入）与 `punctuationEnabled`（标点混乱）。
*   **失效机理**：虽然将翻译链作为“重炮”，将错字/标点作为“物理层干扰”，但由于缺乏对语言模型输出分布的直接约束，二者叠加依然无法破坏 AI 的底层特征。

### 3. gemini.ts — 翻译链与人设改写 (Gemini API Integration)
*   **代码锚定**：[gemini.ts:L82-308](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts#L82-L308)
*   **技术机制**：
    *   `translateChain`（即 `runBabelProtocol`）：执行 `中文 → 德文 → 日文 → 中文` 串行翻译，每步均调用 Gemini API。
    *   `rewriteWithPersona`（即 `rewriteText`）：利用特定作者指纹或动态突变提示词重写文本。
    *   `generateVariants`（即 `runAdversarialCluster`）：并行生成 5 路不同人设风格（语音速记、技术初稿、失眠碎碎念、风格迁移、微博口语）的文本变体。
*   **失效机理**：
    1. **翻译依然是 LLM 生成**：翻译模型本身也是 LLM，输出仍遵循低困惑度的词语搭配规律。
    2. **人设改写的局限性**：设定人设虽能混入部分生理反应和环境噪音，但未受到细粒度词法限制，其局部 Token 转移矩阵仍处于 LLM 的高频概率区间。

### 4. xray.ts — X-Ray 光谱透析扫描仪 (Spectral Analyzer)
*   **代码锚定**：[xray.ts:L109-197](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts#L109-L197)
*   **技术机制**：通过纯客户端正则匹配，对文本进行三色渲染：
    *   <span style="color:#ef4444; font-weight:bold;">红色 (Cliches)</span>：~30 个高频 AI 套话（如“值得注意的是”、“综上所述”等）。
    *   <span style="color:#3b82f6; font-weight:bold;">蓝色 (Transitions)</span>：~20 个逻辑连词（如“然而”、“因此”、“此外”）。
    *   <span style="color:#eab308; font-weight:bold;">黄色 (Structures)</span>：如“不仅……而且……”、“一方面……另一方面……”等并列或排比结构模式。
*   **失效机理**：纯静态正则字典匹配，没有任何机器学习泛化能力，只能提供辅助修改参考，无法直接抵御检测器。

### 5. discriminator.ts — GAN 判别器沙盒 (GAN Discriminator)
*   **代码锚定**：[discriminator.ts:L55-149](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts#L55-L149)
*   **技术机制**：接收多路变体，计算其“人笔得分”：
    *   **困惑度代理（Perplexity proxy）**：计算词汇丰富度（独特词/总词数）。
    *   **突发性得分（Burstiness score）**：计算句长的方差。
    *   **重复度惩罚（Repetition penalty）**：惩罚重复的 n-grams。
    *   **X-Ray 惩罚（X-Ray penalty）**：基于高亮特征数进行扣分。
    *   **综合加权公式**：
        $$\text{Score} = \text{Perplexity} \times 0.3 + \text{Burstiness} \times 0.3 + \text{Repetition} \times 0.2 + \text{X-Ray} \times 0.2$$
*   **失效机理**：**并非真正的深度神经网络判别器**，只是一套简单的客户端 JS 数学公式算出的启发式分数，容易让用户产生误判。

### 6. vectorScope.ts — 向量示波器 (Sentence-BERT Vector Scope)
*   **代码锚定**：[vectorScope.ts:L140-238](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/vectorScope.ts#L140-L238)
*   **技术机制**：计算相邻句子的余弦相似度，并提供基于字符统计特征（汉字比例、句长、标点密度、字符频次等）生成 64 维特征向量的降级算法（`analyzeHeuristic`）。
*   **失效机理**：
    *   在降级或未加载大模型时，该向量本质上是**基于字符统计的指纹，没有真正的语义理解能力**，无法对标真实的 Sentence-BERT 分类器。且该功能仅作可视化展示，无法自动重写。

### 7. temporalForge.ts — 时间戳伪造 (Timestamp Forgery)
*   **代码锚定**：[temporalForge.ts:L55-139](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/temporalForge.ts#L55-L139)
*   **技术机制**：反推数小时的人类非线性修改时间轴，并将这些数据以 `<!-- Edit v1.1 ... -->` 的形式嵌入到 Markdown 注释或文档元数据中导出。
*   **失效机理**：检测器和平台在判定时只分析提交的**纯文本内容**，根本不会去解析文件底部的 HTML 注释或元数据。

---

## 🔬 三、 现代 AI 检测器核心机理与失效根源

### 1. 现代检测器检测手段 (2025-2026)
*   **基于统计/困惑度（Perplexity & Burstiness）**：AI 文本困惑度（选择 Token 的意外程度）极低，且句长与句式均匀（突发性低）。
*   **分类器网络（Classifiers）**：专门训练的深度神经网络，学习并识别 AI 和人类文本特有的高维隐含统计特征。
*   **水印检测（Watermarking）**：部分检测器已开始扫描大模型服务商在输出 Token 流中隐式嵌入的统计水印分布。

### 2. 为什么“天真”的对抗手段必然失效？
*   **多国语言翻译链**：翻译无法改变统计概率。因为最终把文本翻译回目标语言的依然是 LLM，它输出的文本仍然是符合该模型低困惑度特征的 Token 序列。
*   **错字/标点注入**：检测器在计算前通常会对文本进行规范化（Normalization）清洗，直接剔除这些噪点。
*   **同义词替换**：无法动摇深层的统计规律。句子的长度分布、段落衔接模式、过渡词习惯等高维特征才是暴露 AI 属性的核心。

---

## ⚓ 四、 对标开源 `stop-slop` 规范的 AI 特征审计

开源项目 `stop-slop` 揭示了 AI 写作时在词汇、结构与习惯上存在的致命特征词汇与范式（AI Tells）：

### 1. 禁用词汇与喉部清理词 (Banned Phrases)
*   **喉部清理型开头（Throat-clearing）**：`"It's worth noting that"`、`"It's important to remember"`、`"Interestingly enough"`（在当今快速发展的时代、值得注意的是、可以说）。
*   **空洞的强调/赞美（Emphasis crutches）**：`"Fundamentally"`、`"Arguably"`、`"Undeniably"`、`"game-changer"`、`"It cannot be overstated"`、`"tapestry"`、`"vibrant"`、`"delve into"`（画卷、格局、赋能、闭环、底层逻辑、深度剖析）。
*   **冗余副词与过渡词**：`"Notably"`、`"Crucially"`、`"In conclusion"`、`"To summarize"`、`"On the other hand"`（不仅如此、与此同时、总而言之）。

### 2. 禁用公式化结构 (Structural Clichés)
*   **既 A 又 B 结构（Binary contrasts）**：`"It's not just X—it's Y"`。
*   **排比三联律（Rule of Three）**：机械地输出三个并列项。
*   **自问自答句式（Rhetorical setups）**：`"Why does this matter? Because..."`。
*   **虚假拟人化（False agency）**：`"The technology wants..."`（市场选择了、技术旨在）。
*   **冒号标题病**：`"The Future of X: How Y Is Changing Z"`。

### 3. 句法规则约束
*   **禁用 Wh- 引导句**：开头避免使用 What, When, Where, Why, While, Whether。
*   **禁用破折号 (Em-dashes)** 滥用。
*   **禁用情绪化词汇**：避免 "exciting", "fascinating", "remarkable" 等词。
*   **强制使用主动语态**。

### 4. stop-slop 的五维判定维度 (Scoring System)
*   **直截了当 (Directness)**：是否剔除了所有废话和宏大铺垫？
*   **节奏感 (Rhythm)**：句长是否交错，避免均质化？
*   **可信度 (Trust)**：是否尊重读者智商，不堆砌空泛词汇？
*   **真实性 (Authenticity)**：是否有具体、细腻的人类细节？
*   **信息密度 (Density)**：去掉所有冗余成分。

---

## 🚀 五、 针对性改进建议与 V10 演进规划

为了使幽灵打字机的输出通过 AI 检测，V10 版本的技术演进应当采取以下架构方向：

```
                    ┌──────────────────────────────┐
                    │      V10 防检测重构技术路线    │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   生成级词法/概率控制            人机协同透析台重构          外部真实检测闭环
 注入 stop-slop 过滤规则    五色光谱对标 stop-slop      对接真实检测器 API 轮询
 强制降低 Token 预测概率     提供一键同义词/句式切除     不再依靠本地伪判别器算分
```

1.  **大模型重写级的底层概率干预**：
    *   在 [gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts) 中重写 `rewriteText`。将 `stop-slop` 词表作为 Hard Constraint 写入 systemInstruction。
    *   引入 **困惑度扰动** 指令：利用 Temperature (温度值) 与 Top-K 参数的波动，强行让 LLM 放弃首选（最通顺）Token，换用罕见词、特定领域的方言或行业俚语。
    *   强制执行**句长不均等性约束**：要求连续句子的长度差大于 10 个字。
2.  **人机协同透析编辑台的重组**：
    *   重构 [xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts) 以支持五色高亮检测，精确对标 `stop-slop` 的“喉部清理词”、“空洞强调词”、“机械并列结构”等高危特征。
    *   不仅进行高亮，还需在前端交互中提供**一键同义词智能替换列表**与**句式拆碎工具**，真正辅助人类进行“切除手术”。
3.  **闭环真实 API 校验**：
    *   重构 [discriminator.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts)。明确本地的加权得分仅具有本地规则参考意义，无法代表真实通过率。
    *   引导用户配置并真正异步轮询 GPTZero / CopyLeaks 的第三方 API，直接通过实测数据打分进行多路变体优胜淘汰，形成真实的对抗闭环。
