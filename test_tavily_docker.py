import os
import requests
import json

api_key = os.environ.get('TAVILY_API_KEY', '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')
response = requests.post(
    'https://api.tavily.com/search',
    json={
        'api_key': api_key,
        'query': 'DeepSeek',
        'search_depth': 'advanced',
        'include_answer': True,
        'max_results': 5
    },
    headers={'Content-Type': 'application/json'}
)

print(response.status_code)
print(response.text)
