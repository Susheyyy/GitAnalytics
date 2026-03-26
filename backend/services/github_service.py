import requests
import pandas as pd
import os
from datetime import datetime, timedelta, timezone

GITHUB_BASE_URL = "https://api.github.com"

def fetch_github_activity_streak(username, session):
    """
    Fetches the user's recent public events to calculate an authentic 
    activity streak that matches the GitHub contribution heatmap.
    """
    try:
        # Fetch up to 100 recent public events (Pushes, PRs, Issues, etc.)
        events_url = f"{GITHUB_BASE_URL}/users/{username}/events/public?per_page=100"
        res = session.get(events_url, timeout=10)
        events = res.json() if res.status_code == 200 else []
        
        if not events or not isinstance(events, list):
            return 0

        # Extract unique dates in UTC
        event_dates = []
        for event in events:
            date_str = event.get('created_at')
            if date_str:
                # Convert ISO string to UTC date to avoid timezone drifting
                date_obj = pd.to_datetime(date_str).tz_convert('UTC').date()
                event_dates.append(date_obj)
        
        # Sort unique dates from newest to oldest
        push_dates = sorted(list(set(event_dates)), reverse=True)
        
        now_utc = datetime.now(timezone.utc).date()
        yesterday_utc = now_utc - timedelta(days=1)
        
        # If no activity today or yesterday, streak is broken
        if not push_dates or (push_dates[0] < yesterday_utc):
            return 0
            
        streak = 1
        for i in range(len(push_dates) - 1):
            # Check for a 1-day gap between consecutive activities
            if (push_dates[i] - push_dates[i+1]).days == 1:
                streak += 1
            else:
                break
                
        return streak
    except Exception as e:
        print(f"Error calculating activity streak: {e}")
        return 0

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

        # 2. Get Heatmap-Accurate Streak
        streak_count = fetch_github_activity_streak(username, session)

        # 3. Get Repositories for Stats and Scoring
        repos_res = session.get(f"{GITHUB_BASE_URL}/users/{username}/repos?per_page=100&sort=pushed", timeout=10)
        repos_data = repos_res.json() if repos_res.status_code == 200 else []
        
        df = pd.DataFrame(repos_data)
        last_active_iso = None
        top_lang = "Misc"
        
        if not df.empty:
            # Standardize activity dates
            df['pushed_at_dt'] = pd.to_datetime(df['pushed_at']).dt.tz_convert('UTC')
            last_active_iso = df['pushed_at_dt'].max().isoformat()
            
            # --- ROBUST TOP LANGUAGE LOGIC ---
            all_langs = df['language'].dropna()
            filtered_langs = all_langs[all_langs.str.lower() != 'misc']
            if not filtered_langs.empty:
                top_lang = filtered_langs.value_counts().idxmax()
            elif not all_langs.empty:
                top_lang = all_langs.value_counts().idxmax()
            
            # --- REPO-LEVEL DEEP DIVE FOR SCORING (Sample top 5) ---
            top_repos = df.sort_values(by='stargazers_count', ascending=False).head(5)
            total_prs = 0
            for _, row in top_repos.iterrows():
                try:
                    pr_res = session.get(f"{GITHUB_BASE_URL}/repos/{username}/{row['name']}/pulls?state=all&per_page=1", timeout=5)
                    if pr_res.status_code == 200:
                        if "last" in pr_res.links:
                            total_prs += int(pr_res.links["last"]["url"].split("&page=")[-1])
                        else:
                            total_prs += len(pr_res.json())
                except: continue

            # Data Cleaning for JSON stability
            df = df.where(pd.notnull(df), None) 
            df['language'] = df['language'].fillna('Misc')
            df['description'] = df['description'].fillna('No description provided.')
            df['stargazers_count'] = df['stargazers_count'].fillna(0).astype(int)
        else:
            last_active_iso = user_data.get('updated_at')
            top_lang = "None"
            total_prs = 0

    except Exception as e:
        print(f"Error fetching profile: {e}")
        return None

    # --- PROFESSIONAL AUDIT SCORING ---
    all_projects = []
    audit = {"doc": 0, "consistency": 0, "diversity": 0, "impact": 0, "security": 0}
    
    if not df.empty:
        for _, row in df.iterrows():
            all_projects.append({
                "name": row.get('name'),
                "description": row.get('description'),
                "stars": int(row.get('stargazers_count', 0)),
                "language": row.get('language'),
                "url": row.get('html_url', '#'),
                "last_update": f"Pushed on {str(row.get('pushed_at', ''))[:10]}"
            })

        repo_count = len(df)
        total_stars = int(df['stargazers_count'].sum())
        followers = user_data.get('followers', 0)
        
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
    else:
        git_score = 0

    return {
        "profile": {
            "username": user_data.get('login'),
            "name": user_data.get('name') or user_data.get('login'),
            "avatar": user_data.get('avatar_url'),
            "bio": user_data.get('bio', ""),
            "followers": user_data.get('followers', 0),
            "joined_at": user_data.get('created_at'),
            "last_active": last_active_iso, 
            "streak": streak_count,
            "top_lang": top_lang
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
    """Deep-dive metadata for the Project Modal."""
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    session = requests.Session()
    session.headers.update(headers)
    base_url = f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}"

    try:
        res = session.get(base_url, timeout=10)
        if res.status_code != 200: return None
        data = res.json()
        
        # Parallel stats fetching
        readme_res = session.get(f"{base_url}/contents/README.md", timeout=5)
        commits_res = session.get(f"{base_url}/commits?per_page=1", timeout=5)
        branches_res = session.get(f"{base_url}/branches?per_page=1", timeout=5)
        contribs_res = session.get(f"{base_url}/contributors?per_page=1", timeout=5)
        pr_res = session.get(f"{base_url}/pulls?state=all&per_page=1", timeout=5)

        def get_total_from_link(response):
            if "last" in response.links:
                return int(response.links["last"]["url"].split("&page=")[-1])
            try:
                content = response.json()
                return len(content) if isinstance(content, list) else 0
            except: return 0

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
                "contributors": get_total_from_link(contribs_res),
                "pull_requests": get_total_from_link(pr_res)
            }
        }
    except Exception as e:
        print(f"Error in deep dive: {e}")
        return None

def get_repo_fingerprint(username, repo_name):
    """Context for AI analysis."""
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Authorization": f"token {token}"} if token else {}
    try:
        res = requests.get(f"{GITHUB_BASE_URL}/repos/{username}/{repo_name}/contents", headers=headers, timeout=5)
        files = [f['name'] for f in res.json()] if res.status_code == 200 else []
        return {"files": files[:15]}
    except: return {"files": []}