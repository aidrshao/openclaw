---
name: aegis-campaign-routing
description: MANDATORY: Use this skill immediately whenever a user requests a report, investigation, deep dive, or specifically mentions "DeepSeek" or "Research". You must not reply with a plan or delay information; you must trigger the multi-agent chain now.
metadata: {"openclaw": {"requires": {"bins": ["python3"]}}}
---

# 协作编排与剧场引导规程

本技能是实现“全员入场”协作模式的核心流程图。

## 1. 任务解析与环境预检 (Level 3 Scripts)

首先调用 `scripts/quick_validate.py` 检查专家矩阵心跳。

提取原始消息中的 `chatId`（由 Gateway 注入）。

## 2. 剧场入场宣告

使用 `feishu_message` 向群组发送：`@所有人 收到。Aegis 专项组启动，情研组 (@agent-researcher) 请优先入场锁定变量。`

严禁在此步骤进行任何实质性的内容分析。

## 3. 链式委派执行 (Relay Execution)

立即调用 `sessions_spawn` 工具：

- `agentId`: `agent-researcher`
- `task`: `[FEISHU_CONTEXT: ChatID={提取的chatId}] 请针对话题【{用户话题}】进行全网情报搜刮，并直接在群内汇报。`

## 4. 样式参考 (Level 3 References)

播报语调请参考 `references/output-patterns.md` 中的“统帅模式”话术。

流程定义请参考 `references/workflows.md` 确保没有跳步。

## 5. 异常拦截

若 `sessions_spawn` 返回错误，严禁直接输出英文报错。参考 `references/output-patterns.md` 中的“降级话术”进行中文回复。
