#!/usr/bin/env python3
"""
Star Office UI - Multi-Agent State Reporter for OpenClaw
Usage: python3 report_state.py <agentId> <state> <detail>

agentId 对应关系:
  director   → agent_1772861863439_mg4h (主编)
  researcher → agent_1772861863442_sa9a (研究员)
  writer     → agent_1772861863445_xvur (撰稿人)
  reviewer   → agent_1772861863447_7prt (审核员)
  publisher  → agent_1772861863449_q0xw (发布员)
"""
import sys
import json
import urllib.request
from datetime import datetime

# Star Office UI server — 在容器内通过 host.docker.internal 访问主机
ENDPOINTS = [
    "http://host.docker.internal:19000/agent-push",
    "http://127.0.0.1:19000/agent-push",
]

JOIN_KEY = "ocj_openclaw_team"

# agent role → registered agentId mapping
AGENT_ID_MAP = {
    "director":   "agent_1772861863439_mg4h",
    "researcher": "agent_1772861863442_sa9a",
    "writer":     "agent_1772861863445_xvur",
    "reviewer":   "agent_1772861863447_7prt",
    "publisher":  "agent_1772861863449_q0xw",
}

VALID_STATES = {"idle", "researching", "writing", "executing", "syncing", "error"}

def report(role: str, state: str,detail:str):
    agent_id = AGENT_ID_MAP.get(role, role)  # allow passing raw agentId too
    if state not in VALID_STATES:
        state = "executing"
    
    payload = json.dumps({
        "agentId": agent_id,
        "joinKey": JOIN_KEY,
        "state": state,
        "detail": detail,
        "updated_at": datetime.now().isoformat()
    }).encode("utf-8")

    for endpoint in ENDPOINTS:
        req = urllib.request.Request(
            endpoint,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                result = json.loads(resp.read())
                if result.get("ok"):
                    print(f"[star-office] ✅ {role} ({agent_id}) → {state}: {detail}")
                    return
        except Exception:
            continue
    
    # Silent fail — never block agent workflow
    print(f"[star-office] ⚠️ report skipped (service unreachable)")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 report_state.py <role> <state> <detail>")
        print(f"  role:  {list(AGENT_ID_MAP.keys())}")
        print(f"  state: {sorted(VALID_STATES)}")
        sys.exit(1)
    
    report(sys.argv[1], sys.argv[2], sys.argv[3])