from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Import models BEFORE create_all so tables are registered
from models import User, Complaint, StatusHistory

# Import routes
from routes.userRoutes import user_bp
from routes.adminRoutes import admin_bp

app = Flask(__name__)
app.config.from_object(Config)

# Init extensions
CORS(app)                 # allow frontend (localhost:3000) to call backend (127.0.0.1:5000)
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Blueprints
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(admin_bp, url_prefix='/admin')

# Create tables once at startup if not exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
