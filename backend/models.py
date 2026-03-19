from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON # Still keep this for future-proofing
import json

# Initialize the database object
db = SQLAlchemy()

class User(db.Model):
    """
    Stores basic GitHub profile information.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.Integer, unique=True, nullable=True) # ID from GitHub API
    username = db.Column(db.String(80), unique=True, nullable=False)
    avatar_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship: One user can have many analysis reports
    reports = db.relationship('AnalyticReport', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'


class AnalyticReport(db.Model):
    """
    Stores the results of our Pandas analysis.
    """
    __tablename__ = 'analytic_reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Analysis Results
    health_score = db.Column(db.Float, default=0.0)
    repo_count = db.Column(db.Integer, default=0)
    
    # We use a simple String/Text column for languages to ensure SQLite compatibility
    # We will convert it to a dictionary in our code
    languages_json = db.Column(db.Text, default="{}") 
    
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Helper methods to handle the Language Dictionary
    def set_languages(self, lang_dict):
        self.languages_json = json.dumps(lang_dict)

    def get_languages(self):
        return json.loads(self.languages_json)

    def __repr__(self):
        return f'<Report for UserID {self.user_id} - Score: {self.health_score}>'