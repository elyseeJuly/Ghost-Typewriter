# Ghost Typewriter — Hybrid Detox Edition 实施方案书 (EXEC_PLAN)
> **类别**: Executions (活动执行与交付物)  
> **会话日期**: 2026-04-14  
> **生效日期**: 2026-04-14  
> **基于项目**: Ghost Typewriter V7 骨架  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 🎯 一、 实施背景与重构痛点

项目目前拥有一套基础的 Gemini 调用结构及简单的 FingerprintPanel，但缺乏防大语言模型指纹（Fingerprint）的底层核心技术。

本会话旨在通过扩展以下两大模块，将项目升格为 V8.0 阶段：
1. **自动突变矩阵 (Mutation Matrix)**：通过 Protocol Babel 四步多重翻译及前端 Typo/Punctuation 注入，在后台批量撕裂常规 AI 语法树结构。
2. **三色光谱透析 (Detoxification)**：打造可视化 X-Ray 正则扫描高亮引擎及 contenteditable 人机编辑器，支持字数/特征词实时计数，以便快速切除顽固 AI 腔调。

---

## ⚙️ 二、 核心技术设计

### 1. 数据流动设计

```
[原始输入 draftInput]
       │
       ▼ (Stage 1: 自动突变引擎)
┌──────────────────────────────────────────────┐
│  - gemini.ts: runBabelProtocol (指数退避四步)  │
│  - injectors.ts: injectTypos (同音错字)      │
│  - injectors.ts: injectPunctuationChaos      │
└──────────────────────────────────────────────┘
       │
       ▼ (一键注入)
[只读缓存 mutatedText]
       │
       ▼ (Stage 2: 光谱透析)
┌──────────────────────────────────────────────┐
│  - DetoxEditor.tsx (contenteditable 编辑台)   │
│  - xray.ts: runXRayScan (三色正则光谱渲染)     │
│  - 粘贴纯文本拦截 + 实时字数与特征统计面板      │
└──────────────────────────────────────────────┘
       │
       ▼ (复制干净文本)
[无 HTML 干净输出 cleanText]
```

### 2. 状态隔离体系 ([AppContext.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/store/AppContext.tsx))
*   `mutatedText` 仅作为阶段一生成结果的纯只读缓存，不允许 contenteditable 直接双向绑定，从而保证突变原文的“不可变性”以备回退。
*   `detoxText` 作为编辑台的实时承载内容，X-Ray 扫描直接在此之上以 DOM 富文本形式操作渲染。

---

## 🛠️ 三、 拟修改与新增代码清单 (Proposed Changes)

### 1. 新增/重写底层库 (Lib Layer)

#### [NEW] [injectors.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/injectors.ts)
纯前端的随机投毒过滤脚本，暴露两大函数：
- `injectTypos(text, intensity)`：以 `intensity / 200` 的概率随机替换高频虚词（如“的/得”、“在/再”）为同音错字。
- `injectPunctuationChaos(text, intensity)`：以 `intensity / 200` 的概率随机将句末句号替换为 `!!`、`...` 或波浪线。

#### [NEW] [xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts)
X-Ray 扫描分析引擎：
- 导出核心三色特征词典/正则表达式群：
  - `dictCliches`：红色套话词典（“显而易见”、“毋庸置疑”等）。
  - `dictTransitions`：蓝色过渡连词（“总而言之”、“简而言之”等）。
  - `dictStructures`：黄色对称与排比正则规则。
- 导出 `runXRayScan(text)` 函数，扫描文本，优先占位符保护高亮，计算并返回高亮 HTML 树及 `counts` 指标。

#### [MODIFY] [gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts)
- 实现四步串行多重翻译链路：`zh -> de -> ja -> zh`。
- 对每个独立的 API 请求封装自研的**指数退避（Exponential Backoff）重试机制**，防止因高频请求被网络限制或被并发熔断。

#### [MODIFY] [i18n.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/i18n.ts)
- 翻译及注入 V8.0-HYBRID-DETOX UI 中文/英文所有静态及动态 key，实现中英双语界面。

---

### 2. 状态层扩展 (State Layer)

#### [MODIFY] [AppContext.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/store/AppContext.tsx)
- 新增 `mutatedText` 缓存管理。
- 新增三大开关：`isBabelActive`, `isTypoActive`, `isPunctuationActive`。
- 新增滑块状态 `mutationIntensity` (0-100)。
- 暴露 X-Ray 扫描结果与计数看板全局状态。

---

### 3. 组件层重构 (UI Layer)

#### [MODIFY] [App.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/App.tsx)
- 废弃原有 Chatbot，布局升级为三栏式：`ControlPanel(w-72 固定) | InputPanel(flex-1) | DetoxEditor(flex-1)`。

#### [MODIFY] [FingerprintPanel.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/FingerprintPanel.tsx) (重名为 ControlPanel)
- 面板重新设计为突变引擎控制器：包含三大开关 Toggle、强度滑块、X-Ray 图例解释说明及底部的 `⚡ EXECUTE MUTATION` 动作按钮。

#### [MODIFY] [InputPanel.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/InputPanel.tsx)
- 简化中栏输入，增加流水线处理状态指示（Zebra 条形条进度指示器）。

#### [NEW] [DetoxEditor.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/DetoxEditor.tsx)
- **核心交互交互台**：
  - 上半部：`MutatedBuffer` 绿色打字机只读终端，提供 `→ 注入透析台` 桥接按钮。
  - 下半部：富文本 `contenteditable` 编辑器，拦截 paste 输入流过滤为纯文本；挂载 X-Ray 渲染器及 selection 终点焦点保持逻辑；附带顶部的三色指标实时展示栏。

---

## 🛡️ 四、 AI 开发与防抖约束 (AI Rules)

1.  **指数退避防超限**：串行多步 API 必须保证错误拦截，出现 API 报错必须记录状态并逐级延长等待时间重试，最多 3 次。
2.  **富文本粘贴拦截**：DetoxEditor 编辑台不允许含有外来内联 CSS 样式，强制只接收 plain/text 以防高亮渲染器崩溃。
3.  **光标焦点保证**：富文本 innerHTML 重写会导致光标丢失，高亮渲染后焦点须自动安全回退至最尾端，保持输入的可连贯性。
