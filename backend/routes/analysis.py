from flask import Blueprint, jsonify
import traceback
from services.github_service import fetch_github_profile, fetch_repo_details, get_repo_fingerprint
from services.ai_service import analyze_project_with_ai

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze/<username>', methods=['GET'])
def get_user_analysis(username):
    """Main profile analysis endpoint."""
    results = fetch_github_profile(username)
    if not results:
        return jsonify({"error": "User not found"}), 404
    return jsonify(results), 200

@analysis_bp.route('/analyze-repo/<username>/<repo_name>', methods=['GET'])
def get_repo_deep_dive(username, repo_name):
    """Deep Dive endpoint: Fetches repo metadata + AI analysis."""
    repo_data = fetch_repo_details(username, repo_name)
    if not repo_data:
        print(f"DEBUG: Repo details not found for {repo_name}")
        return jsonify({"error": "Repository details not found"}), 404

    fingerprint = get_repo_fingerprint(username, repo_name)

    try:
        print(f"DEBUG: Starting AI analysis for {repo_name}...")
        ai_insight = analyze_project_with_ai(repo_data, fingerprint)
        repo_data['ai_analysis'] = ai_insight
        print("DEBUG: AI analysis successful.")
    except Exception as e:
        print("--- AI SERVICE ERROR ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        traceback.print_exc() 
        repo_data['ai_analysis'] = "AI analysis currently unavailable (Check server logs for details)."

    return jsonify(repo_data), 200