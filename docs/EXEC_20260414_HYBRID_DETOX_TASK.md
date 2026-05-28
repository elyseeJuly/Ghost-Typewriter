# Ghost Typewriter — Hybrid Detox Edition 任务进度清单 (EXEC_TASK)
> **类别**: Executions (活动执行与交付物)  
> **会话日期**: 2026-04-14  
> **状态**: 100% 已完工  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 🛠️ 原子任务开发看板

本清单完整记录 2026-04-14 会话中开发“人机协同排毒版 (Hybrid Detox Edition)”时的原子化任务状态链：

### 1. 底层核心库阶段 (Lib Layer)
- [x] **创建** [src/lib/injectors.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/injectors.ts) 脚本文件
  - [x] 实现同音错字注入函数 `injectTypos`
  - [x] 实现随机句末标点断裂函数 `injectPunctuationChaos`
- [x] **创建** [src/lib/xray.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/xray.ts) 分析引擎
  - [x] 定义红色套话（Cliches）过滤词典
  - [x] 定义蓝色过渡词（Transitions）过滤词典
  - [x] 定义黄色对称句法排比（Structures）匹配正则
  - [x] 实现带优先标记保护的高亮 HTML 渲染生成器 `runXRayScan`
- [x] **修改** [src/lib/gemini.ts](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/lib/gemini.ts)
  - [x] 扩展多重链式翻译函数 `runBabelProtocol`
  - [x] 编写分步执行与指数退避（Exponential Backoff）重试防御
- [x] **重写** `src/lib/i18n.ts` 翻译配置，全面支持 Stage 1 和 Stage 2 对应的中英 UI key。

---

### 2. 状态隔离管理 (State Layer)
- [x] **修改** [src/store/AppContext.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/store/AppContext.tsx) 全局上下文
  - [x] 扩展 `mutatedText` 阶段一缓冲状态及其 setter
  - [x] 注入 `isBabelActive`, `isTypoActive`, `isPunctuationActive` 三大开关状态
  - [x] 扩展 `mutationIntensity` 投毒滑块强度状态与计数状态管理
  - [x] 实现全局统一的状态封装与导出

---

### 3. 三栏视觉重构 (UI Layer)
- [x] **修改** [src/index.css](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/index.css) 样式表
  - [x] 编写黑客文字 Glitch 入侵动画样式
  - [x] 编写流水线加载专用的 Zebra 斑马纹进度条动效
  - [x] 挂载 X-Ray 三色光谱标记 span 下划线及背景发光样式
- [x] **重构** [src/App.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/App.tsx) 主界面
  - [x] 布局重构为 `左控制面板 | 中间原始输入与打字机缓存 | 右侧编辑器透析台` 三栏响应式骨架
  - [x] 废弃与本次排毒主题冲突的 Chatbot 悬浮组件
- [x] **修改** [src/components/FingerprintPanel.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/FingerprintPanel.tsx) (重名为 ControlPanel)
  - [x] 重构为突变矩阵控制器，增加开关组件、强度滑块与 X-Ray 分色图例
- [x] **修改** [src/components/InputPanel.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/InputPanel.tsx)
  - [x] 简化输入框，在底端增设斑马纹流水线任务分步进度条
- [x] **创建** [src/components/DetoxEditor.tsx](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/src/components/DetoxEditor.tsx)
  - [x] 编写只读 `MutatedBuffer` 打字机渐流终端
  - [x] 编写可编辑富文本编辑台 `contenteditable`
  - [x] 挂载粘贴拦截 plain/text 数据过滤机制
  - [x] 挂载实时字数及三色特征标记计数面板
  - [x] 部署富文本高亮重置焦点安全保护逻辑

---

### 4. 联调验证阶段 (Verification Layer)
- [x] **类型检查**：确认本地 `tsc --noEmit` 编译完全通过，零 TypeScript 报错。
- [x] **前端运行**：启动 Vite dev 侦听服务，确认 3000 端口可用，前端热重载无任何异常崩溃。
- [x] **端到端校验**：
  - [x] API Vault Modal 正常输入 Key 并写入 LocalStorage 激活。
  - [x] Stage 1 串行翻译 Babel、Typo 及 Punctuation 联动运行正常。
  - [x] 一键注入透析台，光谱高亮及计数器显示正常。
  - [x] 编辑区内手动修改高亮词，实时自动重新扫描触发高亮。
  - [x] 拦截富文本粘贴，仅引入干净的 text 纯文本。
  - [x] `COPY CLEAN TEXT` 完美导出干净的修改后文本。
