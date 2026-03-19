import requests
import pandas as pd
import os
from datetime import datetime # Add this import

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"}

    user_res = requests.get(f"{GITHUB_BASE_URL}/users/{username}", headers=headers)
    repos_res = requests.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=updated", headers=headers)

    if user_res.status_code != 200:
        return None

    user_data = user_res.json()
    repos_data = repos_res.json()
    df = pd.DataFrame(repos_data)

    # --- LAST SEEN LOGIC ---
    # We take the 'updated_at' from the user profile or the latest repo update
    last_updated_str = user_data.get('updated_at')
    
    # --- REST OF YOUR LOGIC ---
    total_repos = len(df)
    followers = user_data.get('followers', 0)
    org_name = user_data.get('company')

    if not df.empty:
        total_stars = int(df['stargazers_count'].sum())
        total_issues = int(df['open_issues_count'].sum())
        
        # Languages & Health Score
        avg_stars = df['stargazers_count'].mean()
        maintenance_score = total_repos / (total_issues + 1)
        doc_ratio = df['description'].notna().sum() / total_repos
        raw_score = (maintenance_score * 40) + (avg_stars * 30) + (doc_ratio * 30)
        final_score = int(max(0, min(100, raw_score)))
        
        df['language'] = df['language'].fillna('Other')
        languages = df['language'].value_counts().to_dict()
    else:
        total_stars = 0
        final_score = 0
        languages = {}

    achievements = []
    if total_repos > 10: achievements.append("Pull Shark")
    if total_stars > 50: achievements.append("Starstruck")
    if total_repos > 0 and total_issues == 0: achievements.append("Quickdraw")

    is_pro = followers > 100 or total_repos > 50

    return {
        "profile": {
            "username": user_data['login'],
            "avatar": user_data['avatar_url'],
            "bio": user_data['bio'],
            "followers": followers,
            "organization": org_name,
            "is_pro": is_pro,
            "last_active": last_updated_str # Sending the timestamp
        },
        "stats": {
            "repo_count": total_repos,
            "total_stars": total_stars,
            "health_score": final_score,
            "languages": languages,
            "achievements": achievements
        }
    }