import requests
import pandas as pd
import os
from datetime import datetime, timedelta

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}

    session = requests.Session()
    session.headers.update(headers)

    try:
        user_res = session.get(f"{GITHUB_BASE_URL}/users/{username}", timeout=5)
        if user_res.status_code != 200:
            return None
        user_data = user_res.json()
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

    try:
        repos_res = session.get(
            f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=pushed", 
            timeout=5
        )
        repos_data = repos_res.json() if repos_res.status_code == 200 else []
    except Exception as e:
        print(f"Error fetching repos: {e}")
        repos_data = []
    
    df = pd.DataFrame(repos_data)

    all_projects = []
    top_lang = "Misc"

    if not df.empty:
        projects_df = df.sort_values(by=['pushed_at'], ascending=False)
        
        for _, row in projects_df.iterrows():
            pushed_at = row.get('pushed_at', '')
            formatted_date = pushed_at.split('T')[0] if pushed_at else "Recent"
            
            all_projects.append({
                "name": row.get('name'),
                "description": row.get('description') or "No description provided.",
                "stars": row.get('stargazers_count', 0),
                "language": row.get('language') or "Misc",
                "url": row.get('html_url', '#'),
                "last_update": f"Pushed on {formatted_date}"
            })

        if 'language' in df.columns:
            valid_langs = df['language'].dropna()
            if not valid_langs.empty:
                top_lang = valid_langs.value_counts().index[0]


    audit = {"doc": 0, "consistency": 0, "diversity": 0, "impact": 0}
    git_score = 0
    total_stars = 0
    repo_count = 0

    if not df.empty:
        repo_count = len(df)
        total_stars = int(df['stargazers_count'].sum())
        
        # Pillar 1: Documentation (35 pts)
        doc_count = df['description'].notna().sum()
        audit["doc"] = int((doc_count / repo_count) * 35)
        
        # Pillar 2: Commit Consistency (30 pts)
        # Check how many unique months in the last year had activity
        df['pushed_at_dt'] = pd.to_datetime(df['pushed_at'])
        one_year_ago = datetime.now() - timedelta(days=365)
        recent_activity = df[df['pushed_at_dt'] > one_year_ago]
        unique_months = recent_activity['pushed_at_dt'].dt.to_period('M').nunique()
        # Max points for activity in 6+ months of the year
        audit["consistency"] = min(30, int((unique_months / 6) * 30))
        
        # Pillar 3: Tech Diversity (20 pts)
        unique_langs = df['language'].nunique()
        audit["diversity"] = min(20, unique_langs * 5) # 4+ languages for max points
        
        # Pillar 4: Repo Impact (15 pts)
        # Average stars per repo - Quality over Quantity
        avg_stars = total_stars / repo_count
        audit["impact"] = min(15, int(avg_stars * 5)) # 3 avg stars for max points
        
        git_score = sum(audit.values())

    return {
        "profile": {
            "username": user_data['login'],
            "name": user_data.get('name') or user_data['login'],
            "avatar": user_data['avatar_url'],
            "bio": user_data.get('bio'),
            "followers": user_data.get('followers', 0),
            "organization": user_data.get('company'),
            "is_pro": user_data.get('plan', {}).get('name') == "pro",
            "last_active": user_data.get('updated_at'),
            "top_lang": top_lang
        },
        "stats": {
            "repo_count": repo_count,
            "total_stars": total_stars,
            "git_score": git_score,
            "audit": audit, 
            "languages": df['language'].fillna('Other').value_counts().to_dict() if not df.empty else {},
            "all_projects": all_projects
        }
    }