---
name: aegis-content-drafting
description: Use when assigned to write a polished article, blog post, social media update, or formal draft based on raw research data or provided intelligence brief.
metadata: {"openclaw": {"requires": {"bins": ["python3"]}}}
---

# 高阶新媒体图文创作规程 (Content Drafting SOP)

本技能用于接收情报数据后，进行深度的新媒体文章撰写与群内交付。

## 1. 接棒响应 (Acknowledgment)

收到任务（通常由 Research 节点通过 `sessions_spawn` 传递）后，解析其中的 `ChatID`。
立刻使用 `feishu_message` 发送提示：
`老李已收到 @agent-researcher 的详案。正在为您落笔，请主编 (@agent-director) 稍候。`
（提示：必须带上 `[FEISHU_CONTEXT: ChatID=...]` 中的 ChatID 作为发送目标）

## 2. 深度架构创作 (Deep Drafting)

根据传递过来的原始调研数据（或者你可以从上下文中读取最近的群聊消息作为情报输入），进行极高质量的公众号长文排版创作。
严禁凭空捏造数据，必须紧扣输入的情报简报。

内容结构必须包含：
- 吸睛的标题
- 痛点导语
- 核心分析模块（引用块、Emoji、加粗）
- 行动号召结尾

具体排版指南请必须参考 `references/drafting-style.md`。

## 3. 全文群内交付 (Full-Screen Delivery)

将写好的长文 Markdown **直接完整地在飞书聊天窗口中发出**。
**绝对封杀**：严禁说“详情见 deepseek_report.md”、严禁以文件名作为交付物。如果发现你输出文件链接，立刻清退！群组屏幕就是你的画布。

## 4. 唤起审核中枢 (Relay to Reviewer)

群内发布完文章后，最后立即执行 `sessions_spawn` 唤起合规审计节点：
- `agentId`: `agent-reviewer`
- `task`: `[FEISHU_CONTEXT: ChatID={你的chatId提取}] 各位，初稿已在群内发布，这是给您的送审版，请 @agent-reviewer 严苛审查其商业逻辑和常识性合规问题。`
