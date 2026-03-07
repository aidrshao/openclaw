import requests
import sys
import json
import os

# Tavily API key should be provided by environment or hardcoded as fallback.
API_KEY = os.environ.get("TAVILY_API_KEY", "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")

def search(query, num_results=5):
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": API_KEY,
        "query": query,
        "search_depth": "advanced",
        "include_answer": True,
        "max_results": num_results
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_msg += " - " + e.response.text
            except:
                pass
        return {"error": error_msg}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python search.py '<query>'")
        sys.exit(1)
        
    query = sys.argv[1]
    results = search(query)
    print(json.dumps(results, indent=2, ensure_ascii=False))
