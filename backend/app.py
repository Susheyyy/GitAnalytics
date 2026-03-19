import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from routes.analysis import analysis_bp

# 1. Load our environment variables (.env)
load_dotenv()



def create_app():
    app = Flask(__name__)
    
    # 2. Configuration
    # We tell Flask where our database is located
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 3. Enable CORS
    # This is CRITICAL. It allows your React app (on port 3000) 
    # to talk to this Flask app (on port 5000).
    CORS(app)

    # 4. Initialize the database with this app
    db.init_app(app)

    # 5. Register our routes
    # This makes our /api/analyze/... URL work
    app.register_blueprint(analysis_bp, url_prefix='/api')

    # Create the database tables if they don't exist yet
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    # Run the server on port 5000
    app.run(debug=True, port=5000)