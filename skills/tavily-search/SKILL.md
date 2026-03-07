# Tavily Search Skill

## Description
Use Tavily's deep search to find the latest data about topics, especially WeChat articles, DeepSeek applications, and market trends. This is your primary search tool.

## Instructions
1. Query formulation: Break down the user's request into 3-5 specific search queries.
2. Search: Run the search script for each query.
3. Content extraction: Synthesize the `answer` and `results[].content` from Tavily into the final `research_brief.json`.

## Tools
Run the following script to search Tavily:
```bash
python3 scripts/search.py "<query>"
```

## Inputs
- `query` (string): The topic to search for (e.g. "DeepSeek 短视频剪辑 爆款场景").

## Outputs
- JSON object containing `answer` (AI summary) and `results` (sources).
