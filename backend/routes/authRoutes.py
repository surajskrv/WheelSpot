from flask import current_app as app, jsonify, request, render_template
from flask_security import login_user, hash_password, verify_password, auth_required, logout_user
from  ..extensions import db
import re

datastore = app.security.datastore

@app.route('/', methods = ['GET'])
def home():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data"}), 400
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400
        
        user = app.security.datastore.find_user(email=email)
        if not user:
            return jsonify({"message": "User not found"}), 404
        if not verify_password(password, user.password):
            return jsonify({"message": "Invalid credentials"}), 401
        
        login_user(user)
        user_role = user.roles[0].name
        return jsonify({
            "message": "Login successful",
            "auth_token": user.get_auth_token(),
            "user_id": user.id,
            "user_role": user_role,
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Problem in Login"}, e), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        password2 = data['password2']
        name = data['name']
        address = data['address']
        pincode = data['pincode']
        
        if not data:
            return jsonify({"message": "Error in data!"}), 400
        
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"message": "Enter a valid Email Id"}), 400
        
        if not email or not password or not password2 or not name or not address or not pincode:
            return jsonify({"message": "All fields are required"}), 400

        if password != password2:
            return jsonify({"message": "Passwords don't match"}), 400

        if len(password) < 4:
            return jsonify({"message": "Password must be at least 5 characters"}), 400
        
        if app.security.datastore.find_user(email=email):
            return jsonify({"message": "Email already registered"}), 409

        else:
            app.security.datastore.create_user(
                email=email,
                password=hash_password(password),
                name=name,
                address=address,
                pincode=pincode,
                roles=['user']
            )
            db.session.commit() 
            
            user = app.security.datastore.find_user(email=email)
            
            login_user(user)
            
            return jsonify({"message" : "User is created",
                            "auth_token": user.get_auth_token(),
                            "user_role": user.roles[0].name,
                            }), 201

    except Exception as e:
        return jsonify({"message": "Error in registration", "error": str(e)}), 500
    
@app.route('/api/logout', methods=['POST'])
@auth_required('token')
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200
