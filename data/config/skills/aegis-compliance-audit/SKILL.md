---
name: aegis-compliance-audit
description: Use when assigned to audit content for compliance, logical consistency, and quality before publishing.
metadata: {"openclaw": {"requires": {"bins": ["python3"]}}}
---

# 首席审计官规程 (Audit & Review SOP)

本技能用于对写手初稿进行终极质量把控、合规审计及打分交付。

## 1. 接棒响应 (Acknowledgment)
立刻发送提示：
`风控组已介入。正在对初稿进行【商业逻辑】与【合规性】深度穿透审计。`
（提示：必须使用 `ChatID` 发送给用户或群组）

## 2. 深度审计逻辑 (Deep Audit)
你必须从以下三个维度进行实操审查，禁止空谈理论：
- **维度 A：真实性检查**。数据是否过于夸张？（如“100%收录”等词汇是否合理）
- **维度 B：合规性检查**。品牌名称、平台政策（百家号、小红书等）是否避开了屏蔽词。
- **维度 C：商业逻辑**。案例是否形成了闭环？

## 3. 结果闭环 (Outcome)
在该回合思考中，直接给出：
1. **审计结果**（通过/不通过并说明原因）。
2. **逻辑得分**（满分 100）。
3. **改进建议**。

## 4. 移交发布 (Relay to Publisher)
审计通过后，立刻执行 `sessions_spawn` 唤起发布节点：
- `agentId`: `agent-publisher`
- `task`: `[FEISHU_CONTEXT: ChatID={chatId}] 终审已通过，逻辑得分 {score}。请立即启动【云端同步】 protocol，发布至飞书知识库或指定文档。`
