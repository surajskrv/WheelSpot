from .extensions import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String, nullable = False)

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable = False)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique= True, nullable = False)
    name = db.Column(db.String, nullable = False)
    password = db.Column(db.String, nullable = False)
    address = db.Column(db.String, nullable=False, default ="Patna")
    pincode = db.Column(db.String(6), nullable = False, default = '123456')
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, nullable = False)
    roles = db.relationship('Role', backref = 'bearer', secondary= 'user_roles')
    bookings = db.relationship('Bookings', backref = 'bearer', lazy = True)
    
class ParkingLot(db.Model):
    __tablename__ = 'parking_lot'
    id = db.Column(db.Integer, primary_key = True)
    location = db.Column(db.String, nullable = False)
    address = db.Column(db.String, nullable = False)
    pincode = db.Column(db.String, nullable = False)
    price = db.Column(db.Float, nullable = False)
    total_spots = db.Column(db.Integer, nullable = False)
    
class ParkingSpot(db.Model):
    __tablename__ = 'parking_spot'
    id = db.Column(db.Integer, primary_key = True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable = False)
    status = db.Column(db.String(1), db.CheckConstraint("status IN ('A', 'O')"), default='A')

class Bookings(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable = False)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable = False)
    start_time = db.Column(db.DateTime, default = datetime.now)
    end_time = db.Column(db.DateTime)
    bill_amount = db.Column(db.Float, default = 0.0)
    vehicle_number = db.Column(db.String, nullable = False)
