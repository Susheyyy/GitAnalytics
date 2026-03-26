import requests
import pandas as pd
import os
from datetime import datetime, timedelta, timezone

GITHUB_BASE_URL = "https://api.github.com"

def calculate_streak(df):
    """Calculates consecutive days of push activity."""
    if df.empty:
        return 0
    
    # Extract unique dates from the 'pushed_at' column
    df['push_date'] = pd.to_datetime(df['pushed_at']).dt.date
    push_dates = sorted(df['push_date'].unique(), reverse=True)
    
    current_streak = 0
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    # If the last push wasn't today or yesterday, the streak is broken
    if not push_dates or (push_dates[0] != today and push_dates[0] != yesterday):
        return 0
        
    current_streak = 1
    for i in range(len(push_dates) - 1):
        if (push_dates[i] - push_dates[i+1]).days == 1:
            current_streak += 1
        else:
            break
            
    return current_streak

def fetch_github_profile(username):
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)

    try:
        # 1. Get Profile Info
        user_res = session.get(f"{GITHUB_BASE_URL}/users/{username}", timeout=10)
        if user_res.status_code != 200:
            return None
        user_data = user_res.json()

        # 2. GET REPOS SORTED BY PUSH (Authentic activity source)
        repos_res = session.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=pushed", timeout=10)
        repos_data = repos_res.json() if repos_res.status_code == 200 else []
        
        df = pd.DataFrame(repos_data)
        last_active_iso = None
        
        # 3. EXTRACT AUTHENTIC LAST PUSH & CLEAN DATA
        if not df.empty:
            # Set REAL Last Seen data
            df['pushed_at_dt'] = pd.to_datetime(df['pushed_at']).dt.tz_convert('UTC')
            last_push_dt = df['pushed_at_dt'].max()
            last_active_iso = last_push_dt.isoformat()
            
            # Fill NaNs for JSON stability
            df = df.where(pd.notnull(df), None) 
            df['language'] = df['language'].fillna('Misc')
            df['description'] = df['description'].fillna('No description provided.')
            df['stargazers_count'] = df['stargazers_count'].fillna(0).astype(int)
        else:
            last_active_iso = user_data.get('updated_at') # Fallback to profile edit date
            
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
                "last_update": f"Pushed on {str(row.get('pushed_at', ''))[:10]}"
            })

        # Scoring Logic
        repo_count = len(df)
        total_stars = int(df['stargazers_count'].sum())
        
        # Pillar 1: Documentation (35 pts)
        doc_count = df[df['description'] != 'No description provided.'].shape[0]
        audit["doc"] = int((doc_count / repo_count) * 35)
        
        # Pillar 2: Consistency (based on unique months active)
        one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
        # Use UTC version of pushed_at for comparison
        recent = df[df['pushed_at_dt'].dt.tz_localize(None) > one_year_ago.replace(tzinfo=None)]
        if not recent.empty:
            unique_months = recent['pushed_at_dt'].dt.to_period('M').nunique()
            audit["consistency"] = min(30, int((unique_months / 6) * 30))
        
        audit["diversity"] = min(20, df['language'].nunique() * 5)
        audit["impact"] = min(15, int((total_stars / repo_count) * 5) if repo_count > 0 else 0)
        git_score = sum(audit.values())

    return {
        "profile": {
            "username": user_data.get('login'),
            "name": user_data.get('name') or user_data.get('login'),
            "avatar": user_data.get('avatar_url'),
            "bio": user_data.get('bio', ""),
            "followers": user_data.get('followers', 0),
            "joined_at": user_data.get('created_at'),
            "last_active": last_active_iso, # REAL Push Data
            "streak": calculate_streak(df)  # Dynamic Streak
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
    """Fetches metadata for the modal deep-dive."""
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)
    base_url = f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}"

    try:
        res = session.get(base_url, timeout=5)
        if res.status_code != 200: return None
        data = res.json()
        
        readme_res = session.get(f"{base_url}/contents/README.md", timeout=3)
        commits_res = session.get(f"{base_url}/commits?per_page=1", timeout=3)
        branches_res = session.get(f"{base_url}/branches?per_page=1", timeout=3)
        contribs_res = session.get(f"{base_url}/contributors?per_page=1", timeout=3)

        def get_total_from_link(response):
            if "last" in response.links:
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