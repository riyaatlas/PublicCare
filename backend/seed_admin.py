# seed_admin.py
from app import app, db, bcrypt
from models import User

with app.app_context():
    existing = User.query.filter_by(email="superadmin@example.com").first()
    if not existing:
        superadmin = User(
            name="Riya Atlas",
            email="riyaatlas@gmail.com",
            phone="7590887678",
            password=bcrypt.generate_password_hash("Riya*2002").decode("utf-8"),
            role="superadmin",
            department="all"
        )
        db.session.add(superadmin)
        db.session.commit()
        print("✅ SuperAdmin added successfully!")
    else:
        print("ℹ️ SuperAdmin already exists.")
