import requests
import pandas as pd
import os
from datetime import datetime, timedelta

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)

    try:
        user_res = session.get(f"{GITHUB_BASE_URL}/users/{username}", timeout=5)
        if user_res.status_code != 200:
            return None
        user_data = user_res.json()

        repos_res = session.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=pushed", timeout=5)
        repos_data = repos_res.json() if repos_res.status_code == 200 else []
        
        df = pd.DataFrame(repos_data)
        
        # CRITICAL FIX: Replace NaN with None (becomes null in JSON) or empty defaults
        if not df.empty:
            df = df.where(pd.notnull(df), None) 
            df['language'] = df['language'].fillna('Misc')
            df['description'] = df['description'].fillna('No description provided.')
            df['stargazers_count'] = df['stargazers_count'].fillna(0).astype(int)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return None

    all_projects = []
    audit = {"doc": 0, "consistency": 0, "diversity": 0, "impact": 0}
    git_score = 0

    if not df.empty:
        # Projects list for the UI
        for _, row in df.iterrows():
            all_projects.append({
                "name": row.get('name'),
                "description": row.get('description'),
                "stars": int(row.get('stargazers_count', 0)),
                "language": row.get('language'),
                "url": row.get('html_url', '#'),
                "last_update": f"Pushed on {row.get('pushed_at', '')[:10]}"
            })

        # Basic Scoring Logic
        repo_count = len(df)
        total_stars = int(df['stargazers_count'].sum())
        
        # Pillar 1: Documentation (35 pts)
        doc_count = df[df['description'] != 'No description provided.'].shape[0]
        audit["doc"] = int((doc_count / repo_count) * 35)
        
        # Pillar 2: Consistency
        df['pushed_at_dt'] = pd.to_datetime(df['pushed_at']).dt.tz_localize(None)
        one_year_ago = datetime.now() - timedelta(days=365)
        recent = df[df['pushed_at_dt'] > one_year_ago]
        if not recent.empty:
            unique_months = recent['pushed_at_dt'].dt.to_period('M').nunique()
            audit["consistency"] = min(30, int((unique_months / 6) * 30))
        
        audit["diversity"] = min(20, df['language'].nunique() * 5)
        audit["impact"] = min(15, int((total_stars / repo_count) * 5))
        git_score = sum(audit.values())

    return {
        "profile": {
            "username": user_data.get('login'),
            "name": user_data.get('name') or user_data.get('login'),
            "avatar": user_data.get('avatar_url'),
            "bio": user_data.get('bio', ""),
            "followers": user_data.get('followers', 0),
            "joined_at": user_data.get('created_at'),
            "last_active": user_data.get('updated_at')
        },
        "stats": {
            "repo_count": len(df) if not df.empty else 0,
            "total_stars": int(df['stargazers_count'].sum()) if not df.empty else 0,
            "git_score": git_score,
            "audit": audit,
            "languages": df['language'].value_counts().to_dict() if not df.empty else {},
            "all_projects": all_projects
        }
    }
def fetch_repo_details(username, repo_name):
    """
    Fetches comprehensive metadata, including real stats for the modal.
    """
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)
    base_url = f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}"

    try:
        # 1. Basic Repo Metadata
        res = session.get(base_url, timeout=5)
        if res.status_code != 200: return None
        data = res.json()
        
        # 2. Check for README
        readme_res = session.get(f"{base_url}/contents/README.md", timeout=3)
        
        # 3. Fetch Real Stats (Commits, Branches, Contributors)
        # Note: We use per_page=1 and check the 'Link' header for total counts to save API quota
        commits_res = session.get(f"{base_url}/commits?per_page=1", timeout=3)
        branches_res = session.get(f"{base_url}/branches?per_page=1", timeout=3)
        contribs_res = session.get(f"{base_url}/contributors?per_page=1", timeout=3)

        def get_total_from_link(response):
            if "last" in response.links:
                # The 'last' relation link contains the total page count
                return response.links["last"]["url"].split("&page=")[-1]
            return len(response.json()) if response.status_code == 200 else 0

        return {
            "name": repo_name,
            "about": data.get('description') or "No description provided.",
            "stars": data.get('stargazers_count', 0),
            "forks": data.get('forks_count', 0),
            "is_deployed": bool(data.get('homepage')),
            "has_readme": readme_res.status_code == 200,
            "license": data.get('license', {}).get('name') if data.get('license') else "No License",
            "stats": {
                "commits": get_total_from_link(commits_res),
                "branches": get_total_from_link(branches_res),
                "contributors": get_total_from_link(contribs_res)
            }
        }
    except Exception as e:
        print(f"Error in deep dive: {e}")
        return None

def get_repo_fingerprint(username, repo_name):
    """Lists files for AI context."""
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    try:
        res = requests.get(f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}/contents", headers=headers, timeout=5)
        files = [f['name'] for f in res.json()] if res.status_code == 200 else []
        return {"files": files[:15]}
    except Exception: return {"files": []}