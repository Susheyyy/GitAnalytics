import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes.analysis import analysis_bp

from services.github_service import fetch_github_profile
from services.ai_service import generate_tech_roadmap

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///default.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    CORS(app)

    db.init_app(app)

    app.register_blueprint(analysis_bp, url_prefix='/api')

    @app.route('/api/roadmap/<username>', methods=['GET'])
    def get_roadmap(username):
       
        user_data = fetch_github_profile(username) 
        
        if not user_data:
            return jsonify({"error": "User not found or GitHub API limit reached"}), 404

        roadmap_text = generate_tech_roadmap(
            username=username,
            top_lang=user_data['profile']['top_lang'],
            projects=user_data['stats']['all_projects']
        )

        return jsonify({"suggestion": roadmap_text})

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()

    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)