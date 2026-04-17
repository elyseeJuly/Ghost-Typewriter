<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 幽灵打字机 | Ghost Typewriter v9.0
### Adversarial GAN Edition — 业界首个集对抗生成与向量分析于一体的 AI 写作透析平台

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version: 9.0](https://img.shields.io/badge/Version-9.0_GAN-cyan.svg)](#)
[![Tech: React 19](https://img.shields.io/badge/Tech-React_19-61dafb.svg)](#)

</div>

---

## 📖 核心理念：从“盲目降维”到“定向对抗”

**Ghost Typewriter v9.0 (Adversarial GAN Edition)** 不仅仅是一个文本混淆工具。它是一套完整的 **生成对抗网络 (GAN)** 闭环系统。

在 v9.0 版本中，我们引入了四阶段对抗流水线，通过“生成器”不断进化以欺骗“判别器”，并利用“向量示波器”透视残留的 AI 签名，最后通过“时间戳伪造”补完最后的人类行为证据链。

---

## 🛠 四大对抗支柱 (Core Pillars)

### ⚔️ 1. 对抗生成集群 (Adversarial GAN Cluster)
不再依赖单一的生成指令。系统并行启动 5 路迥异的底层风格映射：
- **语音速记风**：模拟低密度的口语化叙述。
- **技术初稿风**：保留专业性但刻意模仿人类起草时的不确定性。
- **失眠碎碎念**：极高混乱度，主要用于通过极端检测环境。
- **风格迁移风**：模拟特定文学风格的词汇分布。
- **微博/口语风**：极简、碎片化，有效撕裂 AI 的长程语义相关性。

### 🔬 2. 判别器沙盒 (AI Discriminator Sandbox)
内置双向验证机制：
- **远程验证**：集成 GPTZero / Originality.ai API（需配置 Key）。
- **本地启发式**：利用 X-Ray 扫描与平均句长方差（ASV）进行离线打分。
- **进化策略**：系统自动记录优胜 Prompt（AI 率最低的版本），并存入“策略档案”。

### 〰 3. 向量示波器 (Vector Scope Analysis)
基于浏览器端 **Sentence-BERT (all-MiniLM-L6-v2)** 实现的语义透析：
- **热力图可视化**：实时监测相邻句子的嵌入向量余弦相似度。
- **死区预警**：自动标记相似度 > 0.85 的“AI 语义死区”。
- **语义撕裂建议**：提示在特定段落插入“感官记忆碎片”以打破 AI 生成的平滑分布。

### ⏱ 4. 时间戳伪造引擎 (Temporal Forge)
提供完整的人性化证据链伪造：
- **非线性历史**：自动生成长达 2 小时的伪造编辑记录（包括停顿、段落删除、重写逻辑）。
- **Markdown 注入**：将伪造的时间轴以 HTML/Markdown 注释形式注入文件 `<!-- Edit v1.2 Time: 2026-04-17 14:32 -->`。

---

## 🚀 快速启动

### 准备工作
- **Node.js**: v18+
- **Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/) 获取。
- **GPTZero API Key** (可选): 用于更高精度的真实判别。

### 安装与运行
1. 克隆并安装依赖：
   ```bash
   npm install
   ```
2. 配置环境变量：
   在 `.env.local` 中填入你的 Key。
   ```bash
   VITE_GEMINI_API_KEY=你的_API_KEY
   VITE_GPTZERO_API_KEY=你的_GPTZERO_KEY (可选)
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```

---

## 🎨 技术架构

- **Frontend**: React 19 + Vite + Vanilla CSS (Glassmorphism Design)
- **AI Core**: Google Gemini Pro + GPTZero API
- **Local ML**: `@xenova/transformers` (WASM Sentence-BERT)
- **State Management**: React Context + Hooks
- **Styling**: Cyberpunk Neo-Classical Aesthetics

---

## ⚖️ 免责声明

本工具仅用于科研、创意写作与防御性反检测教育。请确保在使用生成的文本时符合当地法律法规及学术道德准则。

---

<div align="center">
Designed and Powered by <b>elyseeJuly</b>
</div>
