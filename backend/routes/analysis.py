from flask import Blueprint, jsonify
from services.github_service import fetch_github_profile

# A Blueprint is like a "folder" for our routes to keep things organized
analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze/<username>', methods=['GET'])
def get_analysis(username):
    """
    This is the endpoint: GET /api/analyze/some_username
    It calls our service, gets the data, and sends it back as JSON.
    """
    # 1. Use our service to get GitHub data
    results = fetch_github_profile(username)

    # 2. If GitHub couldn't find the user, tell the frontend
    if not results:
        return jsonify({"error": "User not found or GitHub API limit reached"}), 404

    # 3. Send the successful data back
    return jsonify(results), 200