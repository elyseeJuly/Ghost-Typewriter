# EXEC — 2026-05-21 — Documentation Restructuring Plan
> **项目/仓库**: [ghost-typewriter](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter)
> **执行标准**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)
> **会话日期**: 2026-05-21

---

## 🎯 任务目标

将 `ghost-typewriter` 项目下的所有开发文档和日志根据 **Emberois V2.0 终极开发文档规范** 进行系统性整理：
1. 重构旧有 v9.0 实施日志为 `EXEC_20260417_V9_0_PLAN.md` 等格式。
2. 平铺整理至根 `/docs/` 目录下，清除无用的 `dev_logs/` 子文件夹。
3. 新建主索引注册表 `SPEC_20260521_DOCUMENT_INDEX.md`。
4. 跟踪记录本次重构会话自身的执行文档，并将整套结果同步至 GitHub 远端仓库。

---

## 🛠️ 执行步骤与文件映射

### 1. 搬迁并规范化历史文档
将 `docs/dev_logs/` 的内容根据创建时间（2026-04-17）重命名并移出到 `/docs/` 根目录：
- `docs/dev_logs/v9.0_implementation_plan.md` ➡️ `docs/EXEC_20260417_V9_0_PLAN.md`
- `docs/dev_logs/v9.0_task.md` ➡️ `docs/EXEC_20260417_V9_0_TASK.md`
- `docs/dev_logs/v9.0_walkthrough.md` ➡️ `docs/EXEC_20260417_V9_0_WALKTHROUGH.md`

### 2. 清理临时空目录
物理删除原有的 `docs/dev_logs/` 目录。

### 3. 创建主索引目录 (Document Index)
新建 `docs/SPEC_20260521_DOCUMENT_INDEX.md`，在注册主表中精确锚定项目中存在的所有文档物理链接。

### 4. 补充本次 Restructuring 的执行文档
在 `/docs/` 下生成当前会话所要求的伴生文档（Plan/Task/Walkthrough）。

### 5. Git 同步与推送
执行 `git add`, `git commit` 以及 `git push`，保证云端与本地状态一致。

---

## ⚠️ 约束红线
- 保持原文档内容 **100% 完整**，不得在移动过程中删除或修改历史文字或结论。
- 所有引用必须使用本地绝对文件链接形式 (`file:///...`) 以实现“一键点击直达”。
