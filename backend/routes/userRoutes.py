from flask import Blueprint, request, jsonify
from models import db, User, Complaint, StatusHistory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from utils import generate_ticket
from mlModel import predict_category_and_department

user_bp = Blueprint('user_bp', __name__)
bcrypt = Bcrypt()
@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data:
        return jsonify({"message":"Invalid request"}), 400
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"message":"Email already registered"}), 400
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(name=data['name'], email=data['email'], phone=data['phone'], password=hashed, role='user')
    db.session.add(user)
    db.session.commit()
    return jsonify({"message":"User registered"}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        return jsonify({
            "access_token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "department": user.department
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401


@user_bp.route('/complaint', methods=['POST'])
@jwt_required()
def raise_complaint():
    try:
        # Extract user info from JWT
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role", "user")

        # Get request body
        data = request.get_json()
        description = data.get("description")
        location = data.get("location")
        # Validate input
        if not description or not location:
            return jsonify({"message": "Description and location are required"}), 400

        # Predict category & department automatically
        predicted_category, department = predict_category_and_department(description)

        # Generate ticket number
        ticket_no = generate_ticket(department)

        # Create complaint record
        complaint = Complaint(
            ticket_no=ticket_no,
            user_id=user_id,
            category=predicted_category,
            department=department,
            location=location,
            description=description,
            status="Pending"
        )
        db.session.add(complaint)
        db.session.commit()

        # Create status history record
        history = StatusHistory(
            complaint_id=complaint.id,
            status="Pending",
            changed_by=user_id,
            notes="Complaint created by user"
        )
        db.session.add(history)
        db.session.commit()

        # Final response as per frontend requirement
        return jsonify({
            "message":"Complaint Submitted",
            "ticket_no": ticket_no,
            "department": department,
            "status": "Pending"
        }), 201

    except Exception as e:
        return jsonify({"message": f"Something went wrong: {str(e)}"}), 500

@user_bp.route('/complaints/All', methods=['GET'])
@jwt_required()
def get_complaints():
    try:
        user_id = int(get_jwt_identity())
        complaints = Complaint.query.filter_by(user_id=user_id).all()

        results = []
        for c in complaints:
            results.append({
                "id": c.id,
                "ticket_no": c.ticket_no,
                "category": c.category,
                "department": c.department,
                "status": c.status,
                "description": c.description,
                "location": c.location,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route('/complaints/active', methods=['GET'])
@jwt_required()
def active_complaints():
    try:
        user_id = int(get_jwt_identity())
        complaints = Complaint.query.filter(
        Complaint.user_id == user_id,
        Complaint.status.in_(["Pending", "In Progress"])
    ).order_by(Complaint.created_at.desc()).all()

        results = []
        for c in complaints:
            results.append({
                "id": c.id,
                "ticket_no": c.ticket_no,
                "category": c.category,
                "department": c.department,
                "status": c.status,
                "description": c.description,
                "location": c.location,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route('/complaint/<string:ticket_no>/mark_solved', methods=['PUT'])
@jwt_required()
def mark_solved(ticket_no):
    current_user_id = get_jwt_identity()   # this will be a string
    complaint = Complaint.query.filter_by(ticket_no=ticket_no, user_id=current_user_id).first()

    if not complaint:
        return jsonify({"message": "Not found"}), 404

    complaint.status = 'User Resolved'
    db.session.commit()

    history = StatusHistory(
        complaint_id=complaint.id,
        status='User Resolved',
        changed_by=current_user_id,
        notes='Marked solved by user'
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({"message": "Marked as solved"}), 200

