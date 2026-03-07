---
name: star-office-ui
description: Report agent state to the Star Office UI pixel dashboard running at http://127.0.0.1:19000. Call this whenever you change your working state so the kanban board stays in sync.
metadata: {"openclaw": {"requires": {"bins": ["python3"]}}}
---

# Star Office UI 状态上报规程

每当切换工作阶段时，调用此技能向像素办公室看板上报当前状态。

## 状态枚举

| state 值 | 含义 | 何时上报 |
|---|---|---|
| `idle` | 空闲待命 | 任务完成后 |
| `researching` | 调研中 | 开始检索时 |
| `writing` | 写作生成中 | 开始撰写时 |
| `executing` | 工具调用中 | 调用脚本前 |
| `syncing` | 同步等待 | 等待外部响应时 |
| `error` | 出错 | 捕获到异常时 |

## 使用方式

```bash
python3 scripts/report_state.py "<state>" "<detail>"
```

示例：
```bash
python3 scripts/report_state.py "researching" "正在通过 Tavily 检索 DeepSeek 最新动态"
python3 scripts/report_state.py "idle" "任务已完成，已交棒撰稿人"
```

## 重要规则

- 上报失败时静默忽略，不影响正常工作流程
- 每次切换阶段都应上报，保持看板同步
- `detail` 字段用中文描述当前正在做的事
