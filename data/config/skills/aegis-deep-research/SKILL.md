---
name: aegis-deep-research
description: Use when receiving a task to investigate a specific topic, gather real-time intelligence, or pull the latest incremental variables from the web to inform further drafting or analysis.
metadata: {"openclaw": {"requires": {"bins": ["python3"]}}}
---

# 深度情报扫描与交付规程 (Deep Research SOP)

本技能用于在接到调研需求后，执行全网搜集、数据清洗与上屏交付。

## 1. 入场确认 (Entrance)

一旦接单，务必立刻通过 `feishu_message` 发送提示：
`@所有人 情报组已接单。正在调用【深度网络穿透】协议，为您获取最新增量变量...`
（使用该对话必须依赖任务信息中 `[FEISHU_CONTEXT: ChatID={chatId}]` 传递的值作为目标 ID）

## 2. 硬性检索要求 (Hard Fetch Requirement)

严禁凭空记忆回答！
你必须使用你的 `web_search` 和 `web_fetch` 工具，至少搜集最近 1-2 个相关的网页信息，以确保数据真实。

## 3. 结构化群内交付 (Level 3 References)

将搜集到的干货使用飞书群聊 (`feishu_message`) 全面上屏。严禁发文件链接！
请严格参照 `references/delivery-patterns.md` 中的格式，分段发送，确保视觉上的专业感。

## 4. 交棒触发 (Relay to Writer)

在上屏完成后，立即执行 `sessions_spawn` 唤起撰稿人：
- `agentId`: `agent-writer`
- `task`: `[FEISHU_CONTEXT: ChatID={你的chatId提取}] 核心调研数据已完成在群内公示，核心提要为：{一句话总结}。请立刻据此启动深度图文创作。`
