from datetime import datetime
from database import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    department = db.Column(db.String(50), nullable=True)  # for admins: 'water','electricity','roads','waste','healthcare' or 'all'

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_no = db.Column(db.String(40), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)    # the label predicted by ML model
    department = db.Column(db.String(50), nullable=False)   # one of five departments
    location = db.Column(db.String(200), nullable=False)    # human-readable or "lat,lng"
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Pending')    # Pending / Noted / In Progress / Resolved / Reopened / User Resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class StatusHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaint.id'), nullable=False)
    status = db.Column(db.String(30))
    changed_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # user id (user or admin)
    notes = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
