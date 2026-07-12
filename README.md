<div align="center">

# Ghost Typewriter v9.0
### Adversarial GAN Edition — An AI Writing Detoxification Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: 9.0](https://img.shields.io/badge/Version-9.0_GAN-cyan.svg)](#)
[![Tech: React 19](https://img.shields.io/badge/Tech-React_19-61dafb.svg)](#)
[![Status: Archived](https://img.shields.io/badge/Status-Archived-red.svg)](#)

</div>

---

## Archived Notice

> **This repository is an experimental project and has been archived for learning and reference purposes only.**

There is a significant gap between the technical implementation and the original ideal design. After thorough evaluation, we concluded that the current architecture is unable to meet the expected design goals. Rather than continuing to iterate on a flawed foundation, we have chosen to archive the repository, preserving the complete development history and codebase as a record of technical exploration.
>
> If you find the concepts interesting, you are welcome to Fork and build upon them in your own practice.

---

## Table of Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Disclaimer](#disclaimer)
- [中文版](#中文版)

---

## Overview

**Ghost Typewriter** is a client-side anti-AI-detection text processing system. It rewrites AI-generated drafts through a multi-stage pipeline — mutation, adversarial generation, semantic analysis, and manual detoxification — to reduce the probability of detection by services like GPTZero and Originality.ai.

The project evolved through several versions, with v9.0 introducing a **Generative Adversarial Network (GAN)** approach: five parallel style variants compete against a discriminator, and the winner proceeds to the detox stage.

---

## Design Philosophy

The core doctrine is stated in the [Hybrid Detox Whitepaper](docs/SPEC_20260414_HYBRID_DETOX_PRD_AND_WHITEPAPER.md):

> *Use an automated mutation matrix to destroy large-area machine syntax trees, and use X-ray spectroscopy to guide humans in excising stubborn mechanical skeletons.*

A [later audit](docs/SPEC_20260611_STOP_SLOP_INTEGRATION_AND_ANTI_DETECTION_UPGRADE.md) critically concluded that surface-level noise (typos, punctuation chaos, timestamps) is largely ineffective against modern deep-learning detectors — they normalize it away before feature extraction. The remedy shifted focus toward deeper LLM generation control (banned AI-word lists, forced sentence-length variance) and a multi-dimensional scoring rubric.

### Three Lines of Defense

1. **Lexical & Physical Poisoning** — Typo injection and punctuation chaos at the tokenizer level to break word-frequency distributions.
2. **Statistical & Semantic Reassembly (Protocol Babel)** — A ZH → DE → JA → ZH chain translation that destroys AI co-occurrence probability and syntax trees.
3. **Human-in-the-loop Detoxification** — An X-Ray scan engine renders the editor with a tri-color spectrum (red clichés / blue transitions / yellow parallel structures) so the user can surgically remove "AI tone."

---

## Architecture

The application follows a **three-stage pipeline** with an optional **Stage 0 GAN** adversarial cluster:

```
Stage 0 (optional GAN):
  5 parallel style variants → Discriminator scores → Winner selected

Stage 1: Mutation Matrix
  Draft → [Protocol Babel / Extreme Scramble / Typo / Punctuation] → Mutated Buffer

Stage 2: Detox Editor
  Buffer → contenteditable editor → X-Ray scan + Vector Scope → Clean export
```

**Layout:** Three-column interface.
- **Left** — Control Matrix (GAN toggle, mutation toggles, intensity slider, fingerprints)
- **Center** — Draft input + GAN variant cards
- **Right** — Mutation buffer (typewriter animation) + Detox editor + Vector scope

A floating **Ghost Profiler** chatbot assists with fingerprint extraction and draft pre-scanning.

---

## Features

### Stage 0 — Adversarial GAN Cluster
- **5 parallel persona-driven variants**: Voice Memo, Tech Draft, Sleepless Ramble, Style Transfer, Social Media — each with a distinct system prompt.
- **Discriminator Sandbox**: Scores each variant (0–100, lower = more human). Uses GPTZero API if configured, otherwise falls back to a local heuristic (cliché density + sentence-length variance + transition-word density).
- **Winner selection**: Lowest AI score wins; automatically recorded to a local strategy archive (last 50 winners persisted in `localStorage`).

### Stage 1 — Mutation Matrix
- **Protocol Babel** — 4-step chain translation: ZH → DE → JA → ZH → final polish. Each step is a separate LLM API call with live progress indicators.
- **Extreme Scramble** — Stream-of-consciousness rewrite that bans logical conjunctions and forces short, fragmented sentences.
- **Typo Injector** — Bilingual homophone substitution (的↔地↔得, therefore→therefor, etc.) with configurable intensity.
- **Punctuation Chaos** — Randomizes sentence-ending punctuation (`。` → `……`/`！`/`。。`, `.` → `...`/`!`) and commas to break Burstiness calculations.
- **Auto Chaos Mode** — Randomly composes one directive from each of the four mutation dimensions (Lexical Degradation, Syntax Fracture, Logic Leap, Noise Injection).

### Stage 2 — Detox Editor
- **X-Ray Detox Scan** — Highlights AI-typical patterns in three colors:
  - 🔴 **Red** — Clichés (delve, tapestry, 赋能, 闭环, …)
  - 🔵 **Blue** — Transition words (however, therefore, 然而, 首先, …)
  - 🟡 **Yellow** — Parallel structures (一方面…另一方面, not only…but also, …)
  - Live counters with SAFE/INFECTED threshold (≤3 flagged items = SAFE).
  - Cursor-safe DOM rebuilds and forced plain-text paste.
- **Vector Scope (Semantic Oscilloscope)** — Runs `all-MiniLM-L6-v2` entirely in-browser (WASM via `@xenova/transformers`) to compute cosine similarity between adjacent sentence embeddings. Flags "dead zones" where similarity > 0.85, indicating overly smooth AI-generated text. Falls back to a character-level Jaccard heuristic if the model fails to load.
- **Temporal Forge** — Generates a realistic multi-hour editing trail (initial draft, intermediate edits with random "re-open" duplicates, final proofread, publication check) and exports it as Markdown with invisible HTML-comment metadata: `<!-- Edit v1.1 | Time: 2026-04-17 14:32 | Action: 修改措辞 -->`.

### Cross-Cutting
- **Author Fingerprint Cloning** — Extract writing style (vocabulary, sentence structure, tone, formatting) from past writing via the Ghost Profiler chatbot or manual entry, then inject it into rewrite instructions.
- **Ghost Profiler Chatbot** — A floating, terminal-styled assistant using LLM JSON mode. Two quick commands: **Extract Fingerprint** and **Scan Draft**. Returns structured JSON (`fingerprint` / `prescan` / `error`).
- **Bilingual UI** — Full English / Chinese toggle with persisted preference.
- **Preset Manager** — Save/load/delete intensity + fingerprint combinations.
- **API Vault** — Local-only credential storage. Supports a custom API Base URL for reverse-proxy or compatible API endpoints. Optional GPTZero key for real detection scoring.
- **Cyberpunk UI** — Typewriter animations, scan-line overlays, glowing neon borders, glassmorphism panels.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Bundler | Vite 6 (dev server on port 3000) |
| Styling | Tailwind CSS v4 + custom CSS variables (neon/cyberpunk theme) |
| AI / LLM | `@google/genai` SDK (supports custom base URL for compatible API endpoints) |
| On-device ML | `@xenova/transformers` — `all-MiniLM-L6-v2` (WASM, browser cache) |
| Icons | `lucide-react` |
| Animation | `motion` (Framer Motion) |
| State | React Context + `localStorage` persistence (no Redux/Zustand) |
| Detection API | GPTZero v2 (optional) |

The LLM integration uses the `@google/genai` SDK with a configurable API Base URL, allowing it to connect to any compatible API endpoint (direct or reverse-proxy). All processing is client-side except LLM and optional GPTZero API calls. No backend server is required.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **LLM API Key** — obtain from your API provider
- **GPTZero API Key** (optional) — for real detection scoring

### Installation & Running

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Configure your API keys:
   - Launch the app and the **API Vault** modal will appear on first run (non-cancelable until a key is provided).
   - Enter your LLM API Key (required).
   - Optionally set an API Base URL to point to a compatible endpoint or reverse proxy.
   - Optionally enter a GPTZero API Key for real detection scoring.

   Alternatively, create a `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key
   VITE_GPTZERO_API_KEY=your_gptzero_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

### Convenience Starters

- **Windows**: Double-click `启动幽灵打字机.bat`
- **macOS**: Double-click `启动幽灵打字机.command`

---

## Project Structure

```
ghost-typewriter/
├── src/
│   ├── components/
│   │   ├── ApiVaultModal.tsx       # API credential entry
│   │   ├── Chatbot.tsx             # Ghost Profiler (floating chatbot)
│   │   ├── DetoxEditor.tsx         # Stage 2: editor + mutation buffer
│   │   ├── DiscriminatorPanel.tsx  # GAN scoring + strategy archive
│   │   ├── FingerprintPanel.tsx    # Left column control matrix
│   │   ├── InputPanel.tsx          # Center column: draft input + GAN
│   │   ├── OutputPanel.tsx         # (Legacy, not wired in live app)
│   │   ├── SettingsModal.tsx       # Language, presets, randomize
│   │   ├── TemporalExportModal.tsx # Timestamp forge export
│   │   └── VectorScopePanel.tsx    # Semantic heatmap UI
│   ├── lib/
│   │   ├── discriminator.ts        # AI scoring (GPTZero + heuristic)
│   │   ├── gemini.ts               # LLM API calls + retry logic
│   │   ├── i18n.ts                 # Bilingual string table
│   │   ├── injectors.ts            # Typo/punctuation/stream injection
│   │   ├── mutations.ts            # Mutation directive library
│   │   ├── temporalForge.ts        # Edit trail forge engine
│   │   ├── vectorScope.ts          # MiniLM embeddings + cosine similarity
│   │   └── xray.ts                 # AI-pattern highlight scan
│   ├── store/
│   │   └── AppContext.tsx          # Global state + localStorage
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── docs/                           # Design specs, audit reports, exec plans
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## How It Works

### Data Flow

1. **Input** — User pastes an AI-generated draft into the center column.
2. **Stage 0 (optional)** — GAN mode runs 5 persona variants in parallel via `Promise.all`. The discriminator scores each; the winner is selected and piped to Stage 2.
3. **Stage 1** — The mutation matrix processes the draft:
   - **Protocol Babel** chains through 4 translation steps (ZH→DE→JA→ZH→polish).
   - **Extreme Scramble** breaks logical structure.
   - **Typo/Punctuation injectors** add surface-level noise (pure client-side, no API).
   - The result is displayed in the Mutation Buffer with a typewriter animation.
4. **Stage 2** — The user pipes the mutated text to the Detox Editor:
   - **X-Ray scan** highlights clichés, transitions, and parallel structures.
   - **Vector Scope** runs MiniLM embeddings to detect semantic dead zones.
   - The user manually edits to remove flagged AI patterns.
5. **Export** — Clean text is copied to clipboard, optionally with a forged edit trail embedded as HTML comments.

### State Persistence

All state is persisted to `localStorage`:

| Key | Purpose |
|-----|---------|
| `ghost_api_key` | LLM API key |
| `ghost_api_base_url` | Custom API base URL / reverse proxy |
| `ghost_gptzero_key` | GPTZero API key |
| `ghost_fingerprints` | Author fingerprint list |
| `ghost_language` | UI language preference |
| `ghost_presets` | Saved intensity + fingerprint combos |
| `ghost_intensity` | Mutation intensity (10–100) |
| `ghost_winner_records` | Last 50 GAN winner strategies |

---

## Disclaimer

This tool is intended solely for research, creative writing, and defensive anti-detection education. Ensure that your use of generated text complies with local laws, academic integrity policies, and ethical guidelines.

---

## 中文版

<div align="center">

# 幽灵打字机 v9.0
### 对抗生成版 — AI 写作透析平台

</div>

---

## 归档说明

> **本仓库为实验级作品，现已归档，仅供学习参考。**

在技术实现层面，本项目与最初的理想设计存在巨大差距。经过评估，我们认为当前架构无法达到预期的设计目标，因此选择将仓库归档，保留完整的开发过程与代码作为技术探索的记录。

如果你对本项目的思路感兴趣，欢迎 Fork 并在此基础上进行自己的探索与实践。

---

## 核心理念

核心准则源自[混合解毒白皮书](docs/SPEC_20260414_HYBRID_DETOX_PRD_AND_WHITEPAPER.md)：

> *用自动化矩阵摧毁大面积机器语法树，用 X 射线光谱引导人类切除顽固的机械骨架。*

后续的[审计报告](docs/SPEC_20260611_STOP_SLOP_INTEGRATION_AND_ANTI_DETECTION_UPGRADE.md)批判性地指出：表层的噪声（错别字、标点混乱、时间戳）对现代深度学习检测器基本无效——它们在特征提取前就会将其归一化过滤。因此，重心转向更深层的 LLM 生成控制（禁用 AI 高频词表、强制句长方差）和多维评分体系。

### 三道防线

1. **词汇与物理投毒** — 在分词器层面注入错别字和标点混乱，破坏词频分布。
2. **统计与语义重组（巴别塔协议）** — 中→德→日→中链式翻译，摧毁 AI 的共现概率和语法树。
3. **人工介入解毒** — X 射线扫描引擎以三色光谱（红色陈词滥调 / 蓝色过渡词 / 黄色平行结构）渲染编辑器，让用户精准切除"AI 腔"。

---

## 架构

采用**三阶段流水线**，可选 **Stage 0 GAN** 对抗集群：

```
Stage 0（可选 GAN）：
  5 路并行风格变体 → 判别器打分 → 选择优胜者

Stage 1：变异矩阵
  草稿 → [巴别塔协议 / 极限扰乱 / 错别字 / 标点混乱] → 变异缓冲区

Stage 2：解毒编辑器
  缓冲区 → contenteditable 编辑器 → X 射线扫描 + 向量示波器 → 干净导出
```

**界面布局：** 三栏式。
- **左栏** — 控制矩阵（GAN 开关、变异开关、强度滑块、作者指纹）
- **中栏** — 草稿输入 + GAN 变体卡片
- **右栏** — 变异缓冲区（打字机动画）+ 解毒编辑器 + 向量示波器

浮动的 **幽灵画像师** 聊天机器人辅助指纹提取和草稿预扫描。

---

## 功能列表

### Stage 0 — 对抗生成集群
- **5 路人格驱动变体**：语音速记、技术初稿、失眠碎碎念、风格迁移、微博口语——各有独立系统提示词。
- **判别器沙盒**：对每个变体打分（0–100，越低越像人类）。配置了 GPTZero API 时使用真实检测，否则回退到本地启发式（陈词滥调密度 + 句长方差 + 过渡词密度）。
- **优胜选择**：AI 率最低者获胜，自动记录到本地策略档案（最近 50 条保存在 `localStorage`）。

### Stage 1 — 变异矩阵
- **巴别塔协议** — 4 步链式翻译：中→德→日→中→最终润色。每步独立 LLM API 调用，带实时进度指示。
- **极限扰乱** — 意识流重写，禁止逻辑连接词，强制短句碎片化。
- **错别字注入** — 双语同音字替换（的↔地↔得, therefore→therefor 等），强度可调。
- **标点混乱** — 随机化句尾标点（`。` → `……`/`！`/`。。`）和逗号，破坏 Burstiness 计算。
- **自动混沌模式** — 从四个变异维度（词汇降解、语法断裂、逻辑跳跃、噪声注入）各随机选取一条指令组合。

### Stage 2 — 解毒编辑器
- **X 射线解毒扫描** — 三色高亮 AI 典型模式：
  - 🔴 **红色** — 陈词滥调（delve, tapestry, 赋能, 闭环, …）
  - 🔵 **蓝色** — 过渡词（however, therefore, 然而, 首先, …）
  - 🟡 **黄色** — 平行结构（一方面…另一方面, not only…but also, …）
  - 实时计数器，SAFE/INFECTED 阈值（≤3 项 = SAFE）。
  - 光标安全的 DOM 重建，强制纯文本粘贴。
- **向量示波器** — 在浏览器端运行 `all-MiniLM-L6-v2`（通过 `@xenova/transformers` 的 WASM 后端）计算相邻句子嵌入向量的余弦相似度。标记相似度 > 0.85 的"语义死区"，提示插入"感官记忆碎片"打破 AI 的平滑分布。模型加载失败时回退到字符级 Jaccard 启发式。
- **时间戳伪造引擎** — 生成逼真的多小时编辑轨迹（初稿、中间编辑带随机"重新打开"重复、最终校对、发布检查），导出为带有不可见 HTML 注释元数据的 Markdown：`<!-- Edit v1.1 | Time: 2026-04-17 14:32 | Action: 修改措辞 -->`。

### 横切功能
- **作者指纹克隆** — 通过幽灵画像师聊天机器人或手动输入，从过往写作中提取风格（词汇、句法、语气、格式），注入重写指令。
- **幽灵画像师聊天机器人** — 浮动终端风格助手，使用 LLM JSON 模式。两个快捷命令：**提取指纹** 和 **扫描草稿**。返回结构化 JSON（`fingerprint` / `prescan` / `error`）。
- **双语 UI** — 完整中英文切换，偏好持久化。
- **预设管理器** — 保存/加载/删除强度+指纹组合。
- **API 保险库** — 仅本地存储凭证。支持自定义 API Base URL，可接入兼容的 API 端点或反向代理。可选 GPTZero Key 用于真实检测评分。
- **赛博朋克 UI** — 打字机动画、扫描线叠加、霓虹发光边框、毛玻璃面板。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.8 |
| 构建工具 | Vite 6（开发服务器端口 3000）|
| 样式 | Tailwind CSS v4 + 自定义 CSS 变量（霓虹/赛博朋克主题）|
| AI / LLM | `@google/genai` SDK（支持自定义 Base URL，可接入兼容的 API 端点）|
| 端侧 ML | `@xenova/transformers` — `all-MiniLM-L6-v2`（WASM，浏览器缓存）|
| 图标 | `lucide-react` |
| 动画 | `motion`（Framer Motion）|
| 状态管理 | React Context + `localStorage` 持久化（无 Redux/Zustand）|
| 检测 API | GPTZero v2（可选）|

LLM 集成使用 `@google/genai` SDK，支持配置自定义 API Base URL，可连接任意兼容的 API 端点（直连或反向代理）。除 LLM 和可选的 GPTZero API 调用外，所有处理均在客户端完成，无需后端服务器。

---

## 快速启动

### 准备工作
- **Node.js** v18+
- **LLM API Key** — 从你的 API 提供商获取
- **GPTZero API Key**（可选）— 用于更高精度的真实判别

### 安装与运行

1. 克隆并安装依赖：
   ```bash
   npm install
   ```

2. 配置 API 密钥：
   - 启动应用后，**API 保险库**弹窗会在首次运行时出现（未输入 Key 前不可关闭）。
   - 输入 LLM API Key（必填）。
   - 可设置 API Base URL，指向兼容的 API 端点或反向代理。
   - 可选输入 GPTZero API Key 以启用真实检测评分。

   也可以创建 `.env.local`：
   ```bash
   VITE_GEMINI_API_KEY=你的_API_KEY
   VITE_GPTZERO_API_KEY=你的_GPTZERO_KEY
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:3000`。

### 便捷启动器
- **Windows**：双击 `启动幽灵打字机.bat`
- **macOS**：双击 `启动幽灵打字机.command`

---

## 免责声明

本工具仅用于科研、创意写作与防御性反检测教育。请确保在使用生成的文本时符合当地法律法规及学术道德准则。

---

<div align="center">
Designed and Powered by <b>elyseeJuly</b>
</div>
