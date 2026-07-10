# 幽灵打字机 (Ghost Typewriter) — stop-slop 深度集成与反 AI 检测率提升技术分析报告
> **文档号**: AUDIT_20260611_STOP_SLOP_FEASIBILITY_AND_UPGRADE_REPORT  
> **项目版本**: V10.0-PRO-ANTI-DETECTION (规划中)  
> **生成日期**: 2026-06-11  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/emberois-dev-standards/specifications/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 📖 一、 现存防检测机制失效根源审计 (V9.0)

根据对幽灵打字机 V9.0 的审计结果，系统目前使用的反 AI 检测技术面对现代 AI 检测器（如 GPTZero、Originality.ai、CopyLeaks、Turnitin 等）时已基本失效。以下为各核心模块的失效机理分析：

1. **`injectors.ts`（错字与标点投毒）**: 
   * **代码锚定**: [injectors.ts:L74-145](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/injectors.ts#L74-L145)
   * **失效机理**: 现代检测器在进行文本特征计算前，首要步骤是**文本归一化与清洗（Text Normalization）**。异形标点（如 `，` → `⸒`）与明显同音错字会直接被检测器过滤并纠正，无法动摇其对文本深层概率分布的判断。
2. **`gemini.ts`（多国语言翻译链 - Babel Protocol）**:
   * **代码锚定**: [gemini.ts:L82-146](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts#L82-L146)
   * **失效机理**: 虽然在多国语言之间连续互译（中 $\rightarrow$ 德 $\rightarrow$ 日 $\rightarrow$ 中）能够打乱句式逻辑，但在生成最终中文文本时，仍然是由 LLM（如 Gemini）基于其词表概率分布输出。这使得输出文本仍停留在低困惑度（Perplexity）的高频区间。
3. **`discriminator.ts`（本地启发式判别器）**:
   * **代码锚定**: [discriminator.ts:L55-96](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts#L55-L96)
   * **失效机理**: 本地判别器主要依赖 30 个词的静态敏感词库，以及简单的句长方差计算，并非真实的深度学习模型。这种“沙盒验证”无法对标外部检测器高达百亿参数的分类器网络，极易给用户带来虚假的安全感。
4. **`xray.ts`（静态三色高亮）**:
   * **代码锚定**: [xray.ts:L109-197](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts#L109-L197)
   * **失效机理**: 正则匹配能力极其有限，只能辅助修改套话，缺乏对 AI 常见公式化句式和行文习惯的深层映射。
5. **`vectorScope.ts`（向量示波器）**:
   * **代码锚定**: [vectorScope.ts:L140-238](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/vectorScope.ts#L140-L238)
   * **失效机理**: 在降级运行或本地未加载 Sentence-BERT 时，其基于字符频率生成的 64 维特征向量无语义理解能力；且该模块目前仅做可视化展示，未与生成阶段形成动态干预闭环。
6. **`temporalForge.ts`（时间戳伪造）**:
   * **代码锚定**: [temporalForge.ts:L55-139](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/temporalForge.ts#L55-L139)
   * **失效机理**: 大多数平台在进行 AI 判定时，只会提取文本内容（纯文本模式），其在导出的 Markdown 文件底部注入的 `<!-- Edit v1.1 ... -->` 行为证据链根本无法被检测器的概率检测引擎捕获。

> [!IMPORTANT]
> **失效根本原因**
> 现代 AI 检测器是通过计算**高维 Token 序列的概率分布（困惑度 Perplexity & 突发性 Burstiness）**来判定的，而非简单的表面噪声（标点/错字）。天真的局部混淆手段无法阻断分类器对统计学特征的识别。

---

## 🔬 二、 开源项目 `stop-slop` 深度解析

`stop-slop`（https://github.com/hardikpandya/stop-slop）是一套开源的 **“AI 腔调（AI Slop）主动干预与剔除规范”**。它**不是**一个运行期检测代码库，而是一套**专为 AI 写作定制的质量提升与防特征化提示词（Prompt）架构规则集**。

它揭示了 AI 写作时在词汇、结构与习惯上存在的致命特征词汇与范式（AI Tells）：

### 1. 禁用词汇与空洞修饰词 (Banned Phrases)
* **喉部清理型开头（Throat-clearing）**: AI 特别喜欢用宏大的废话作为段落开端，例如 `"It's worth noting that"`、`"It's important to remember"`（在当今快速发展的时代、值得注意的是、可以说）。
* **空洞的强调/赞美 (Emphasis crutches)**: 滥用极其宽泛且虚无的词汇，例如 `"delve"`、`"tapestry"`、`"beacon"`、`"synergy"`、`"leverage"`、`"闭环"`、`"底层逻辑"`、`"赋能"`、`"画卷"` 等。
* **冗余副词与过渡词**: 如 `"Notably"`、`"Crucially"`、`"In conclusion"`（不仅如此、总而言之、众所周知）。

### 2. 禁用公式化结构 (Structural Clichés)
* **既 A 又 B 结构 (Binary contrasts/Seesaw Sentences)**: `"It's not just X—it's Y"`（不仅是……更是……）。
* **排比三联律 (Rule of Three)**: 机械地在句末或句中输出三个并列项。
* **自问自答句式 (Rhetorical setups)**: `"Why does this matter? Because..."`。
* **假性施动/虚假拟人 (False agency)**: `"The data suggests that..."`（数据表明了……/技术旨在……）。

### 3. 五维质量评估模型 (Scoring Rubric)
`stop-slop` 提出了一套 5 维的文本质量判定维度，用于量化 AI 痕迹：
1. **直截了当 (Directness)**: 是否删除了所有喉部清理和无意义的过渡。
2. **节奏感 (Rhythm)**: 句长是否交错，避免均质化。
3. **可信度 (Trust)**: 是否去掉夸张虚词，尊重读者智商。
4. **真实性 (Authenticity)**: 文本是否包含具体、细腻的人类细节，而非大而空的概念。
5. **信息密度 (Density)**: 去除所有副词和冗余成分，保持核心信息硬度。

---

## 🛠️ 三、 `stop-slop` 与本项目的深度融合方案 (V10.0)

`stop-slop` 与 Ghost Typewriter 项目**完全可以深度结合**。由于 `stop-slop` 本身是 text-based 的规则集，集成重点应该放在**“LLM 级生成侧硬阻断”**、**“本地判别评分重构”** 以及 **“交互级五色透析”** 上：

### 1. LLM 生成层控制重构 (修改 [gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts))
在调用 Gemini API 的 `systemInstruction` 和生成参数中，强制植入 `stop-slop` 核心指令：
* **词汇黑名单硬阻断**: 
  在重写提示词（如 `rewriteText`）中汉化并植入中英双语禁用词表：
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
  在 Prompt 中设置强规则限制：`“你严禁输出包含以下词汇的文本：[BANNED_WORDS]”`。
* **语法与结构强约束**:
  1. **句长不均度**: 要求连续句子长度差必须大于 10 个字符，每 3 句中必须夹杂 1 句 5 字以内的极短句。
  2. **禁用对称结构**: 严禁连续出现排比、三联律结构。
  3. **零喉部清理**: 严禁铺垫，首句直切主题。

### 2. 本地判别评分层升级 (重构 [discriminator.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/discriminator.ts))
废除无效的本地静态启发评分，重构为基于 `stop-slop` 五维评估的轻量级特征评估器 `evaluateStopSlop(text)`，满分为 50 分（每维 10 分），低于 35 分判定为 AI Slop：
* **直截了当 (Directness)**: 计算首句 Announcement 虚词及铺垫句的密度。
* **节奏感 (Rhythm)**: 计算句子长度的标准差 $\sigma$，若 $\sigma < 8$ 或存在高度对称句式则严重扣分。
* **信息密度 (Density)**: 统计副词（adverbs）和空泛修饰形容词的字数占比。
* **可信度 (Trust)**: 扫描 AI 特征黑话（如“底层逻辑”、“闭环”等）的触发频次。

### 3. X-Ray 协同层升级 (重写 [xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts))
将三色光谱升级为符合 `stop-slop` 规范的 **“五色透析光谱（Pentachrome Spectrum）”**：

| 颜色 (Color) | 扫描属性 | 匹配对象与示例 | 建议操作 |
| :--- | :--- | :--- | :--- |
| **红色 (Red)** | **AI Clichés (套话)** | `底层逻辑`、`赋能`、`闭环`、`delve`、`tapestry` | 提供一键同义词替换 |
| **蓝色 (Blue)** | **Transitions (避险/过渡连词)** | `值得注意的是`、`也就是说`、`然而` | 直接删除/切除前缀 |
| **黄色 (Yellow)**| **Formulaic (套路结构)** | Seesaw 对称句式、三联排比（`不仅...而且...`） | 结构重组，长短交错 |
| **紫色 (Purple)**| **Throat-clearing (喉部清理)** | 首句铺垫（`在当今快速发展的时代...`） | 强行裁剪，直奔主题 |
| **橙色 (Orange)**| **Vague Words (空泛副词)** | `极大地`、`深深地`、`absolutely`、`really` | 直接删除修饰词 |

---

## 🚀 四、 提升反 AI 检测率的系统性策略

要让重写后的文本真正通过 GPTZero、Originality 等顶级分类器的判定，Ghost Typewriter V10 应当采取以下五个方向的“高维概率对抗”和“细粒度腔调手术”：

### 1. 突破困惑度（Perplexity）陷阱：动态参数扰动
* **策略**: 在调用 Gemini API 时，避免使用固定生成参数。我们应当在请求时**动态加入小范围随机噪音（Jitter）**，使 `temperature` 在 `0.85` 至 `1.05` 之间微幅波动，迫使 LLM 避开首选（高概率）Token，换用罕见同义词、特定领域的行业黑话或俗语。

### 2. 破坏均质性（Burstiness）特征：强制句长变奏
* **策略**: 通过 Prompt 强制干预重写阶段的句长构成。要求输出结果严格遵守“短句-短句-复杂长句-极短句”等节奏循环，阻断检测器对句长方差（Uniformity）的统计判定。

### 3. 人机协同“切除术”：五色光谱交互
* **策略**: 前端编辑器五色高亮检测到 `stop-slop` 特征后，在浮动提示中提供**一键同义词库替换**和**一键句式切断重组建议**。通过人类的“微小手术”，彻底撕裂 AI 生成的平滑语义向量。

### 4. 引入“感官记忆碎片”注入（Sensory Memory Injection）
* **策略**: 系统自动引导用户在段落中随机注入极度具体的人类感官碎片（例如：*“空调压缩机发出了沉闷的噪音”*，*“桌上的热咖啡已经凉了”*）。这能够有效打破 Sentence-BERT 中的平滑高相似度，消除“AI 语义死区”。

### 5. 对接真实检测器 API，实现对抗进化闭环
* **策略**: 重构判别器模块，使用户能配置 `GPTZero API Key`，并异步轮询真实 API 分数。在 Adversarial Cluster 生成的 5 路变体中，**唯有通过真实 API 判定率最低的文本才能被判定为 Winner**，并在本地构建优秀 Prompt 指令库，真正逼迫生成器“进化”。
