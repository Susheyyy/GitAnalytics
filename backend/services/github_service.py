import requests
import pandas as pd
import os

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}
    
    # Use a session for better performance
    session = requests.Session()
    session.headers.update(headers)

    # 1. Fetch User Data
    try:
        user_res = session.get(f"{GITHUB_BASE_URL}/users/{username}", timeout=5)
        if user_res.status_code != 200: return None
        user_data = user_res.json()
    except: return None

    # 2. Fetch Repos (Sorted by most recent push)
    try:
        repos_res = session.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=pushed", timeout=5)
        repos_data = repos_res.json() if repos_res.status_code == 200 else []
    except: repos_data = []
    
    df = pd.DataFrame(repos_data)

    all_projects = []
    if not df.empty:
        # Sort by most recently pushed
        projects_df = df.sort_values(by=['pushed_at'], ascending=False)
        
        for _, row in projects_df.iterrows():
            # Instead of a slow API call, we use the timestamp for a 'Live' feel
            pushed_at = row.get('pushed_at', '')
            formatted_date = pushed_at.split('T')[0] if pushed_at else "Recent"
            
            all_projects.append({
                "name": row.get('name'),
                "description": row.get('description') or "No description provided.",
                "stars": row.get('stargazers_count', 0),
                "language": row.get('language') or "Misc",
                "url": row.get('html_url', '#'),
                "last_update": f"Pushed on {formatted_date}" # Replaces last_commit
            })

    # Stats Calculation
    total_stars = int(df['stargazers_count'].sum()) if not df.empty else 0
    repo_count = len(df)
    
    # Professional Health Score Formula
    if not df.empty:
        doc_score = (df['description'].notna().sum() / repo_count) * 50
        lang_diversity = min(30, df['language'].nunique() * 6)
        health_score = int(max(0, min(100, doc_score + lang_diversity + 20)))
    else:
        health_score = 0

    return {
        "profile": {
            "username": user_data['login'],
            "name": user_data.get('name') or user_data['login'],
            "avatar": user_data['avatar_url'],
            "bio": user_data.get('bio'),
            "followers": user_data.get('followers', 0),
            "organization": user_data.get('company'),
            "is_pro": user_data.get('plan', {}).get('name') == 'pro',
            "last_active": user_data.get('updated_at')
        },
        "stats": {
            "repo_count": repo_count,
            "total_stars": total_stars,
            "health_score": health_score,
            "languages": df['language'].fillna('Other').value_counts().to_dict() if not df.empty else {},
            "all_projects": all_projects
        }
    }