# 幽灵打字机 (Ghost Typewriter) — 开发文档主注册表目录 (Document Index)
> **项目版本**: V9.0-ADVERSARIAL-GAN  
> **生效日期**: 2026-05-21  
> **管理规范**: [SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md](file:///Users/quantumrose/Documents/Emberois/SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md)

---

## 📖 目录管理概述

本文件是 `Ghost Typewriter` 项目所有开发设计、技术规格、审计报告、历史归档及活动执行文档的主注册表。
所有新建、更新或废弃的开发文档都必须在此注册登记，以维护项目极高的一致性、可检索性与可追溯性。

> [!IMPORTANT]
> **编写与阅读指引**：
> 1. **链接规范**：所有注册项必须使用 **本地绝对链接** (`file:///...`) 锚定，便于开发者在编辑器中“一键直达”。
> 2. **前缀规则**：必须严格遵循 `SPEC_`、`AUDIT_`、`TEST_`、`HIST_`、`EXEC_` 五大全局分类前缀命名。

---

## 🏷️ 文档注册主表 (Document Registry)

| # | 文档物理名称 | 类别前缀 | 创建/更新日期 | 描述与核心内容 | 本地文件绝对链接 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `SPEC_20260521_DOCUMENT_INDEX.md` | `SPEC_` | 2026-05-21 | 本主注册表目录文档。项目文档唯一的全局事实索引。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/SPEC_20260521_DOCUMENT_INDEX.md) |
| 2 | `EXEC_20260417_V9_0_PLAN.md` | `EXEC_` | 2026-04-17 | **v9.0 对抗生成版本实施方案**。包含 5 路生成对抗网络（GAN）、Sentence-BERT 客户端向量示波器及时间伪造的技术实现决策。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260417_V9_0_PLAN.md) |
| 3 | `EXEC_20260417_V9_0_TASK.md` | `EXEC_` | 2026-04-17 | **v9.0 对抗生成版本开发追踪清单**。记录所有前端组件和后端 API 的开发与测试状态。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260417_V9_0_TASK.md) |
| 4 | `EXEC_20260417_V9_0_WALKTHROUGH.md` | `EXEC_` | 2026-04-17 | **v9.0 对抗生成版本完工汇报**。包括 GPGPU 粒子管线、判别器沙盒和时间戳伪造的最终交付校验和 GitHub 同步证明。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260417_V9_0_WALKTHROUGH.md) |
| 5 | `EXEC_20260521_DOC_RESTRUCTURING_PLAN.md` | `EXEC_` | 2026-05-21 | **文档规范化整理执行方案**。根据 Emberois 终极开发文档规范进行结构化重组的方案。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260521_DOC_RESTRUCTURING_PLAN.md) |
| 6 | `EXEC_20260521_DOC_RESTRUCTURING_TASK.md` | `EXEC_` | 2026-05-21 | **文档规范化整理任务清单**。伴随重构操作的实时 TODO task 任务进度清单。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260521_DOC_RESTRUCTURING_TASK.md) |
| 7 | `EXEC_20260521_DOC_RESTRUCTURING_WALKTHROUGH.md` | `EXEC_` | 2026-05-21 | **文档规范化整理交付验证汇报**。包含重构完成后的 100% 结构验证与 GitHub 同步最终汇报。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/ghost-typewriter/docs/EXEC_20260521_DOC_RESTRUCTURING_WALKTHROUGH.md) |

---

> [!TIP]
> 文档索引表在每次大模型开发会话启动和交付时，均应由 `Documenter` 进行首轮审计与同步维护，确保项目脉络不出现任何“黑盒断层”。
