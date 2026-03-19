import requests
import pandas as pd
import os

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"}

    # 1. Fetch User Profile Data
    user_res = requests.get(f"{GITHUB_BASE_URL}/users/{username}", headers=headers)
    if user_res.status_code != 200:
        return None
    user_data = user_res.json()

    # 2. Fetch ALL Repositories (Handling Pagination)
    all_repos = []
    page = 1
    
    while True:
        # We add 'per_page=100' to get more data at once and 'page' to loop through them
        repos_url = f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&page={page}"
        repos_res = requests.get(repos_url, headers=headers)
        
        if repos_res.status_code != 200:
            break
            
        data = repos_res.json()
        if not data: # If the page is empty, we've reached the end!
            break
            
        all_repos.extend(data)
        page += 1

    # --- PANDAS ANALYSIS ---
    df = pd.DataFrame(all_repos)

    if df.empty:
        return {
            "profile": {"username": username, "avatar": user_data['avatar_url'], "bio": user_data['bio']},
            "stats": {"languages": {}, "health_score": 0, "repo_count": 0}
        }

    # Clean data & calculate stats
    df['language'] = df['language'].fillna('Other')
    languages = {str(k): int(v) for k, v in df['language'].value_counts().to_dict().items()}

    total_repos = int(len(df))
    stars = int(df['stargazers_count'].sum())
    forks = int(df['forks_count'].sum())
    issues = int(df['open_issues_count'].sum())

    # Health Score Logic (same as before but with full data)
    health_score = (total_repos * 10) + (stars * 5) + (forks * 2) - issues
    final_score = int(max(0, min(100, health_score)))

    return {
        "profile": {
            "username": user_data['login'],
            "avatar": user_data['avatar_url'],
            "bio": user_data['bio']
        },
        "stats": {
            "languages": languages,
            "health_score": final_score,
            "repo_count": total_repos
        }
    }