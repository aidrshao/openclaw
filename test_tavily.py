import requests
import os

API_KEY = os.environ.get('TAVILY_API_KEY', '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')
resp = requests.post(
    'https://api.tavily.com/search',
    json={
        'api_key': API_KEY,
        'query': 'DeepSeek',
        'search_depth': 'advanced',
        'include_answer': True,
        'max_results': 5
    },
    headers={'Content-Type': 'application/json'}
)
print("STATUS CODE:", resp.status_code)
print("RESPONSE BODY:", resp.text)
