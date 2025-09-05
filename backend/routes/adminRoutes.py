from flask import Blueprint, request, jsonify
from models import db, User, Complaint, StatusHistory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

admin_bp = Blueprint('admin_bp', __name__)
bcrypt = Bcrypt()

# ---------------- SuperAdmin Register Subadmin ----------------
@admin_bp.route('/register-subadmin', methods=['POST'])
@jwt_required()
def register_subadmin():
    claims = get_jwt()   # ✅ fetch claims instead of identity
    if claims.get("role") != "superadmin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    email = data.get('email')
    dept = data.get('department')

    if not email or not dept:
        return jsonify({"message": "Email and department required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Subadmin already exists"}), 400

    subadmin = User(
        name=data.get('name', f"{dept.title()} Admin"),
        email=email,
        phone=data.get('phone', '0000000000'),
        password=bcrypt.generate_password_hash(
            data.get('password', 'admin123')
        ).decode('utf-8'),
        role='admin',
        department=dept
    )
    db.session.add(subadmin)
    db.session.commit()

    return jsonify({"message": f"✅ Subadmin for {dept} created successfully!"}), 201


# ---------------- Login ----------------
@admin_bp.route('/login', methods=['POST'])
def login_admin():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        # ✅ allow only admin/superadmin
        if user.role not in ['admin', 'superadmin']:
            return jsonify({"message": "Unauthorized"}), 403

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role,
                "department": user.department
            }
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


# ---------------- Active Complaints ----------------

@admin_bp.route('/active-complaints', methods=['GET'])
@jwt_required()
def active_complaints():
    claims = get_jwt()   # ✅ fetch role & department from claims
    role = claims.get("role")
    department = claims.get("department")
    user_id = get_jwt_identity()   # this will just be the string user id

    if role not in ['admin', 'superadmin']:
        return jsonify({"message": "Unauthorized"}), 403

    query = Complaint.query.filter(Complaint.status.in_(["Pending", "In Progress"]))

    if role == 'admin':  # filter by department
        query = query.filter_by(department=department)

    complaints = query.order_by(Complaint.created_at.desc()).all()

    out = [{
        "id": c.id,
        "ticket_no": c.ticket_no,
        "department": c.department,
        "status": c.status,
        "description": c.description,
        "location": c.location,
        "created_at": c.created_at
    } for c in complaints]

    return jsonify(out), 200



# ---------------- Complaint History ----------------
@admin_bp.route('/complaint-history', methods=['GET'])
@jwt_required()
def complaint_history():
    claims = get_jwt()   # fetch extra claims from token
    current_role = claims.get("role")
    current_department = claims.get("department")

    if current_role not in ['admin', 'superadmin']:
        return jsonify({"message": "Unauthorized"}), 403

    query = Complaint.query.filter(Complaint.status == "User Resolved")

    if current_role == 'admin':  # restrict to admin’s department
        query = query.filter_by(department=current_department)

    complaints = query.order_by(Complaint.updated_at.desc()).all()
    out = [{
        "ticket_no": c.ticket_no,
        "department": c.department,
        "status": c.status,
        "description": c.description,
        "location": c.location,
        "resolved_at": c.updated_at
    } for c in complaints]

    return jsonify(out), 200



# ---------------- Status Update ----------------
@admin_bp.route('/complaint/<string:ticket_no>/status', methods=['PUT'])
@jwt_required()
def update_complaint_status(ticket_no):
    claims = get_jwt()
    current_role = claims.get("role")
    current_department = claims.get("department")

    if current_role not in ['admin', 'superadmin']:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json or {}
    new_status = data.get("status")  # expected: "In Progress", "Resolved", etc.
    notes = data.get("notes", "")

    if not new_status:
        return jsonify({"message": "New status required"}), 400

    # ✅ Correct way: lookup by ticket_no, not primary key
    complaint = Complaint.query.filter_by(ticket_no=ticket_no).first_or_404()

    # Restrict department for normal admins
    if current_role == "admin" and complaint.department != current_department:
        return jsonify({"message": "Unauthorized to update this complaint"}), 403

    # Business rule: Only allow Pending → In Progress
    if complaint.status == "Pending" and new_status != "In Progress":
        return jsonify({"message": "You can only move Pending → In Progress"}), 400

    # Update complaint status
    complaint.status = new_status
    db.session.commit()

    # Save history
    history = StatusHistory(
        complaint_id=complaint.id,
        status=new_status,
        changed_by=claims.get("sub"),  # user_id from token
        notes=notes
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({"message": f"✅ Complaint {complaint.ticket_no} updated to {new_status}"}), 200
