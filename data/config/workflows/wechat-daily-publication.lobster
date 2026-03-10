# wechat-daily-publication.lobster
# 微信公众号每日自动产出流水线

description: 自动化情报检索、AI对抗生成、人类审批、微信发布全链路。

# 计划任务：每日清晨 08:30 唤醒
on:
  schedule: "30 8 * * *"

workflow:
  # 第一阶段：情报与选题
  - stage: Intelligence
    agent: agent-researcher
    task: |
      检索过去24小时内公众号垂直领域的爆款文章。
      使用 wechat-search 检索阅读量 > 10000 的文章。
      分析评论区情绪，输出 research_brief.json 到共享空间。
    output: research_brief.json

  # 第二阶段：ReAct 对抗生成循环
  - stage: Drafting
    agent: agent-writer
    input: research_brief.json
    loop:
      max_iterations: 3
      process:
        - action: write_draft
          instruction: 根据研究简报，写出一篇符合深度文风的公众号文章，严禁 AI 痕迹。
        - action: audit_draft
          agent: agent-reviewer
          instruction: 挑刺！寻找逻辑漏洞和排版错误。如果 approved 为 false，直接打回。
      until: reviewer.approved == true

  # 第三阶段：人类门控 (Human-in-the-loop)
  - stage: Approval
    agent: agent-director
    action: feishu_card_approval
    params:
      title: "今日公众号图文已就绪"
      content: "${agent-writer.draft_summary}"
      approval_required: true

  # 第四阶段：成果落地
  - stage: Distribution
    agent: agent-publisher
    condition: ${stage.Approval.result == 'approved'}
    action: feishu_create_doc
    params:
      folder_id: "${ENV.FEISHU_TARGET_FOLDER_ID}"
      title: "今日公众号预发布：${agent-writer.article_title}"
      content: "${agent-writer.final_markdown}"
