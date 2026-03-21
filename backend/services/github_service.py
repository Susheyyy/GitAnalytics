import requests
import pandas as pd
import os
from datetime import datetime, timedelta, timezone

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
        df['pushed_at_dt'] = pd.to_datetime(df['pushed_at'])
        # FIX: Added timezone.utc to match GitHub's timezone-aware data
        one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
        recent_activity = df[df['pushed_at_dt'] > one_year_ago]
        unique_months = recent_activity['pushed_at_dt'].dt.to_period('M').nunique()
        audit["consistency"] = min(30, int((unique_months / 6) * 30))
        
        # Pillar 3: Tech Diversity (20 pts)
        unique_langs = df['language'].nunique()
        audit["diversity"] = min(20, unique_langs * 5)
        
        # Pillar 4: Repo Impact (15 pts)
        avg_stars = total_stars / repo_count
        audit["impact"] = min(15, int(avg_stars * 5))
        
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
            "joined_at": user_data.get('created_at'),
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

def fetch_repo_details(username, repo_name):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)
    base_repo_url = f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}"

    try:
        repo_res = session.get(base_repo_url, timeout=5)
        if repo_res.status_code != 200: return None
        repo_data = repo_res.json()

        readme_res = session.get(f"{base_repo_url}/contents/README.md", timeout=3)
        has_readme = readme_res.status_code == 200

        def get_count(url):
            res = session.get(f"{url}?per_page=1", timeout=3)
            if 'Link' in res.headers:
                return int(res.headers['Link'].split('page=')[-1].split('>')[0])
            return len(res.json()) if res.status_code == 200 else 0

        return {
            "name": repo_name,
            "about": repo_data.get('description') or "No description provided.",
            "stars": repo_data.get('stargazers_count', 0),
            "forks": repo_data.get('forks_count', 0),
            "license": repo_data.get('license', {}).get('spdx_id') if repo_data.get('license') else "No License",
            "deployed_link": repo_data.get('homepage'),
            "is_deployed": bool(repo_data.get('homepage')),
            "tags": repo_data.get('topics', []),
            "has_readme": has_readme,
            "stats": {
                "commits": get_count(f"{base_repo_url}/commits"),
                "branches": get_count(f"{base_repo_url}/branches"),
                "contributors": get_count(f"{base_repo_url}/contributors")
            }
        }
    except Exception: return None

def get_repo_fingerprint(username, repo_name):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)
    try:
        res = session.get(f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}/contents", timeout=5)
        files = [f['name'] for f in res.json()] if res.status_code == 200 else []
        tech_hits = [f for f in files if f in ['package.json', 'requirements.txt', 'go.mod', 'pom.xml', 'docker-compose.yml']]
        return {"files": files[:15], "tech_stack": tech_hits}
    except Exception: return {"files": [], "tech_stack": []}