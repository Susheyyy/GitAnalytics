import requests
import pandas as pd
import os

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"}

    user_res = requests.get(f"{GITHUB_BASE_URL}/users/{username}", headers=headers)
    if user_res.status_code != 200:
        return None
    user_data = user_res.json()

    repos_res = requests.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100", headers=headers)
    repos_data = repos_res.json()
    df = pd.DataFrame(repos_data)

    user_plan = user_data.get('plan', {})
    is_github_pro = user_plan.get('name') == 'pro'

    if not df.empty:
        total_repos = len(df)
        total_stars = int(df['stargazers_count'].sum())
        total_issues = int(df['open_issues_count'].sum())
        
        avg_stars = df['stargazers_count'].mean()
        maintenance_score = total_repos / (total_issues + 1)
        doc_ratio = df['description'].notna().sum() / total_repos
        final_score = int(max(0, min(100, (maintenance_score * 40) + (avg_stars * 30) + (doc_ratio * 30))))
        
        df['language'] = df['language'].fillna('Other')
        languages = df['language'].value_counts().to_dict()
    else:
        total_stars, final_score, languages, total_repos = 0, 0, {}, 0

    return {
        "profile": {
            "username": user_data['login'],
            "name": user_data.get('name', user_data['login']),
            "avatar": user_data['avatar_url'],
            "bio": user_data['bio'],
            "followers": user_data.get('followers', 0),
            "organization": user_data.get('company'),
            "is_pro": is_github_pro,
            "last_active": user_data.get('updated_at')
        },
        "stats": {
            "repo_count": total_repos,
            "total_stars": total_stars,
            "health_score": final_score,
            "languages": languages
        }
    }