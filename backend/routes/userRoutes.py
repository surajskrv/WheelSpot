from flask import current_app as app, jsonify, request
from flask_security import auth_required, roles_required, current_user
from ..extensions import db
from ..models import ParkingLot, ParkingSpot, Bookings
from datetime import datetime
import random, re
from ..tasks import booking_update_daily
from celery.result import AsyncResult

@app.route("/api/user/parking/lot/view", methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_home():
    try:
        user = current_user
        parkingLots = ParkingLot.query.all()
        lots = [{
            "id": lot.id,
            "location": lot.location,
            "price": lot.price,
            "available_spots": lot.total_spots - ParkingSpot.query.filter_by(lot_id=lot.id, status='O').count()
        } for lot in parkingLots]
        
        return jsonify({
            "lots" : lots,
            "user_id": user.id,
            "message" :"Getting Parking lot info successfully"
        }), 200
    except Exception as e:
        return jsonify({"message": "Problem fetching user info", "error": str(e)}), 500

@app.route("/api/user/book/spot/<int:lotId>", methods=["POST"])
@auth_required('token')
@roles_required('user')
def book_parking_spot(lotId):
    try:
        data = request.get_json()
        vehicle_number = data.get("vehicle_number", "").upper().strip()
        start_time = datetime.now()

        if not lotId or not vehicle_number:
            return jsonify({"message": "Lot ID and vehicle number are required"}), 400

        vehicle_number_patter = r'^[A-Z]{2}[ ]?[0-9]{2}[ ]?[A-Z]{1,2}[ ]?[0-9]{4}$'
        if not re.match(vehicle_number_patter, vehicle_number):
            return jsonify({"message": "Invalid vehicle number format"}), 400

        available_spots = ParkingSpot.query.filter_by(lot_id=lotId, status='A').all()
        if not available_spots:
            return jsonify({"message": "No available spots in the selected lot"}), 400

        selected_spot = random.choice(available_spots)

        booking = Bookings(
            user_id=current_user.id,
            lot_id=lotId,
            spot_id=selected_spot.id,
            vehicle_number=vehicle_number,
            start_time=start_time
        )

        selected_spot.status = 'O'

        db.session.add(booking)
        db.session.commit()

        return jsonify({
            "message": "Parking spot booked successfully",
            "booking_id": booking.id,
            "spot_id": selected_spot.id,
            "lot_id": lotId,
        }), 201

    except Exception as e:
        return jsonify({"message": "Error booking parking spot", "error": str(e)}), 500

@app.route("/api/user/spot/release/preview/<int:spot_id>", methods=["GET"])
@auth_required('token')
@roles_required('user')
def preview_release_spot(spot_id):
    try:
        booking = Bookings.query.filter_by(spot_id=spot_id, user_id=current_user.id, end_time=None).first()
        if not booking:
            return jsonify({"message": "No active booking found for this spot"}), 404

        releasing_time = datetime.now()
        parked_duration = (releasing_time - booking.start_time).total_seconds() / 3600
        parked_hours = max(1, int(parked_duration)) 

        lot = ParkingLot.query.get(booking.lot_id)
        total_cost = round(parked_hours * lot.price, 2)

        return jsonify({
            "spot_id": booking.spot_id,
            "vehicle_number": booking.vehicle_number,
            "parking_time": booking.start_time.strftime("%Y-%m-%d %H:%M"),
            "releasing_time": releasing_time.strftime("%Y-%m-%d %H:%M"),
            "total_cost": total_cost,
        }), 200

    except Exception as e:
        return jsonify({"message": "Error fetching preview", "error": str(e)}), 500

@app.route("/api/user/spot/release/<int:spot_id>", methods=["POST"])
@auth_required('token')
@roles_required('user')
def release_parking_spot(spot_id):
    try:
        if not spot_id:
            return jsonify({"message": "spot_id is required"}), 400

        booking = Bookings.query.filter_by(user_id=current_user.id, spot_id=spot_id, end_time=None).first()

        if not booking:
            return jsonify({"message": "No active booking found for this spot"}), 404

        end_time = datetime.now()
        booking.end_time = end_time

        parked_duration = (end_time - booking.start_time).total_seconds() / 3600
        parked_hours = max(1, int(parked_duration)) 
        lot = ParkingLot.query.get(booking.lot_id)
        cost = round(parked_hours * lot.price, 2)
        
        booking.bill_amount = cost

        spot = ParkingSpot.query.get(spot_id)
        spot.status = 'A'

        db.session.commit()

        return jsonify({
            "message": "Spot released successfully",
        }), 200

    except Exception as e:
        return jsonify({"message": "Error releasing spot", "error": str(e)}), 500

@app.route("/api/user/spot/history", methods=["GET"])
@auth_required('token')
@roles_required('user')
def user_spot_history():
    try:
        user = current_user
        bookings = Bookings.query.filter_by(user_id=user.id).all()

        history = []
        for booking in bookings:
            lot = ParkingLot.query.get(booking.lot_id)
            spot = ParkingSpot.query.get(booking.spot_id)
            history.append({
                "booking_id": booking.id,
                "spot_id": spot.id if spot else 0,
                "location": lot.location if lot else "Unknown",
                "vehicle_number": booking.vehicle_number,
                "start_time": booking.start_time.strftime("%Y-%m-%d %H:%M"),
                "end_time": booking.end_time.strftime("%Y-%m-%d %H:%M") if booking.end_time else None,
                "total_cost": booking.bill_amount
            });
        return jsonify({"history": history}), 200

    except Exception as e:
        return jsonify({"message": "Error fetching spot history", "error": str(e)}), 500

@app.route("/api/user/summary", methods=["GET"])
@auth_required('token')
@roles_required('user')
def user_summary():
    try:
        user_id = current_user.id
        bookings = Bookings.query.filter_by(user_id=user_id).all()
        booking_data = []
        total_amount = 0

        for booking in bookings:
            lot = ParkingLot.query.get(booking.lot_id)
            spot = ParkingSpot.query.get(booking.spot_id)
            total_amount += booking.bill_amount
            booking_data.append({
                "lot_location": lot.location if lot else "Unknown",
                "spot_id": spot.id if spot else 0,
                "amount": booking.bill_amount,
                "start_time": booking.start_time.strftime('%Y-%m-%d %H:%M'),
                "end_time" : booking.end_time.strftime('%Y-%m-%d %H:%M') if booking.end_time else "Still Parked",
                "vehicle_number": booking.vehicle_number,
            })
        return jsonify({
            "total_bookings": len(bookings),
            "total_amount": total_amount,
            "bookings": booking_data
        }), 200
    except Exception as e:
        return jsonify({"message": "Error fetching user summary", "error": str(e)}), 500
