from flask import Blueprint, jsonify
from services.github_service import fetch_github_profile

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze/<username>', methods=['GET'])
def get_analysis(username):
    """
    This is the endpoint: GET /api/analyze/some_username
    It calls our service, gets the data, and sends it back as JSON.
    """
    results = fetch_github_profile(username)

    if not results:
        return jsonify({"error": "User not found or GitHub API limit reached"}), 404

    return jsonify(results), 200