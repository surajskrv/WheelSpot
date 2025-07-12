from flask import current_app as app, request, jsonify
from flask_security import auth_required, roles_required
from ..extensions import db
from ..models import User, ParkingLot, ParkingSpot, Bookings

#  ---- view all parking lots ----
@app.route("/api/admin/lot/view", methods=["GET"])
@auth_required('token')
@roles_required('admin')
def view_parking_lots():
    lots = ParkingLot.query.all()
    return jsonify([{
        "id": lot.id,
        "location": lot.location,
        "pincode": lot.pincode,
        "address": lot.address,
        "price": lot.price,
        "total_spots": lot.total_spots,
        "occupied_spots": ParkingSpot.query.filter_by(lot_id=lot.id, status='O').count(),
        "spots": [{
            "id": spot.id,
            "status": spot.status
        } for spot in ParkingSpot.query.filter_by(lot_id=lot.id).all()]
    } for lot in lots]), 200

#  ---- creating a parking lot ---
@app.route("/api/admin/lot/create", methods=["POST"])
@auth_required('token')
@roles_required('admin')
def create_parking_lot():
    data = request.get_json()
    try:
        new_parking_lot = ParkingLot(
            location=data['location'],
            address=data['address'],
            pincode=data['pincode'],
            price=data['price'],
            total_spots=data['total_spots'],
        )
        db.session.add(new_parking_lot)
        db.session.commit()

        no_of_spots = new_parking_lot.total_spots
        lot_id = new_parking_lot.id
        for _ in range(no_of_spots):
            spot = ParkingSpot(lot_id=lot_id, status='A') 
            db.session.add(spot)

        db.session.commit()
        
        return jsonify({"message": "Parking lot created"}), 201
    except Exception as e:
        return jsonify({"message": "Error creating parking lot", "error": str(e)}), 500
    
# --- updating parking lot details ---
@app.route("/api/admin/lot/update/<int:lot_id>", methods=["POST"])
@auth_required('token')
@roles_required('admin')
def update_parking_lot(lot_id):
    data = request.get_json()
    try:
        parking_lot = ParkingLot.query.get(lot_id)
        if not parking_lot:
            return jsonify({"message": "Parking lot not found"}), 404

        try:
            new_total_spots = int(data.get("total_spots", parking_lot.total_spots))
        except (ValueError, TypeError):
            return jsonify({"message": "Invalid value for total_spots"}), 400

        spots_occupied = ParkingSpot.query.filter_by(lot_id=lot_id, status='O').count()

        if new_total_spots < spots_occupied:
            return jsonify({
                "message": "Cannot reduce total spots below currently occupied spots",
                "occupied_spots": spots_occupied,
            }), 400

        parking_lot.location = data.get("location", parking_lot.location)
        parking_lot.address = data.get("address", parking_lot.address)
        parking_lot.pincode = str(data.get("pincode", parking_lot.pincode))
        parking_lot.price = float(data.get("price", parking_lot.price))

        if new_total_spots != parking_lot.total_spots:
            if new_total_spots < parking_lot.total_spots:
                remove_count = parking_lot.total_spots - new_total_spots
                spots_to_remove = ParkingSpot.query.filter_by(lot_id=lot_id, status='A').limit(remove_count).all()

                if len(spots_to_remove) < remove_count:
                    return jsonify({"message": "Not enough available spots to remove"}), 400

                for spot in spots_to_remove:
                    db.session.delete(spot)

            elif new_total_spots > parking_lot.total_spots:
                for _ in range(new_total_spots - parking_lot.total_spots):
                    db.session.add(ParkingSpot(lot_id=lot_id, status='A'))

            parking_lot.total_spots = new_total_spots

        db.session.commit()
        return jsonify({"message": "Parking lot updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating parking lot", "error": str(e)}), 500

# --- Deleting a parking lot ----
@app.route("/api/admin/lot/delete/<int:lot_id>", methods=["DELETE"])
@auth_required('token')
@roles_required('admin')
def delete_parking_lot(lot_id):
    try:
        parking_lot = ParkingLot.query.get(lot_id)
        if not parking_lot:
            return jsonify({"message": "Parking lot not found"}), 404
        
        spots_occupied = ParkingSpot.query.filter_by(lot_id=lot_id, status='O').count()
        
        if spots_occupied != 0:
            return jsonify({
                "message": "Cannot delete parking lot with occupied spots",
                "occupied_spots": spots_occupied
            }), 400
        
        else:
            ParkingSpot.query.filter_by(lot_id=lot_id).delete()
            # Bookings.query.filter_by(lot_id=lot_id).delete()
            db.session.delete(parking_lot)
            db.session.commit()
            return jsonify({"message": "Parking lot deleted"}), 200
    except Exception as e:
        return jsonify({"message": "Error deleting parking lot", "error": str(e)}), 500
    
# ---- view or delete spot is not occupied ----
@app.route("/api/admin/spot/<int:spot_id>", methods=["GET", "DELETE"])
@auth_required('token')
@roles_required('admin')
def view_or_delete_parking_spot(spot_id):
    try:
        spot = ParkingSpot.query.get(spot_id)
        if not spot:
            return jsonify({"message": "Parking spot not found"}), 404

        if request.method == "GET":
            if spot.status == 'O':
                booking = Bookings.query.filter_by(spot_id=spot.id).first()
                return jsonify({
                    "id": spot.id,
                    "lot_id": spot.lot_id,
                    "status": spot.status,
                    "userId" : booking.user_id,
                    "vehicleNum": booking.vehicle_number,
                    "startTime": booking.start_time,
                }), 200
            else:
                return jsonify({
                    "id": spot.id,
                    "lot_id": spot.lot_id,
                    "status": spot.status,
                }), 200
            
        elif request.method == "DELETE":
            if spot.status == 'O':
                return jsonify({"message": "Can't delete an occupied spot"}), 400
            
            parking_lot = ParkingLot.query.get(spot.lot_id)
            if not parking_lot:
                return jsonify({"message": "parking lot not found which consists this spot"}), 404

            db.session.delete(spot)
            parking_lot.total_spots -= 1
            db.session.commit()

            return jsonify({"message": f"Spot ID {spot_id} deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

#  ----- getting all users details -----
@app.route("/api/admin/users", methods=["GET"])
@auth_required('token')
@roles_required('admin')
def get_all_users():
    try:
        users = User.query.all()
        users_list = []

        for user in users:
            role_names = [role.name for role in user.roles]
            if 'admin' not in role_names:
                users_list.append({
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "address": user.address,
                    "pincode": user.pincode,
                })

        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching users", "error": str(e)}), 500
    
# --- deleting a user ----
@app.route("/api/admin/user/delete/<int:user_id>", methods=["DELETE"])
@auth_required('token')
@roles_required('admin')
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        if user.id == 1: 
            return jsonify({"message": "Cannot delete the super admin user"}), 403

        active_booking = Bookings.query.filter_by(user_id=user.id, end_time=None).first()
        if active_booking:
            return jsonify({
                "message": "Cannot delete user with active (ongoing) parking."
            }), 400
        
        past_bookings = Bookings.query.filter_by(user_id=user.id).all()
        for b in past_bookings:
            db.session.delete(b)

        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": "Error deleting user", 
            "error": str(e)
        }), 500


@app.route("/api/admin/search", methods=["GET"])
@auth_required('token')
@roles_required('admin')
def admin_search():
    search_type = request.args.get("type")
    search_query = request.args.get("query")

    if not search_type or not search_query:
        return jsonify({"message": "Search type and query required"}), 400

    results = []

    try:
        if search_type == "user":
            user = User.query.filter_by(id=int(search_query)).first()
            if user:
                results.append({
                    "type": "user",
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "pincode": user.pincode
                })

        elif search_type == "location":
            lots = ParkingLot.query.filter(ParkingLot.address.ilike(f"%{search_query}%")).all()
            for lot in lots:
                spots = ParkingSpot.query.filter_by(lot_id=lot.id).all()
                occupied = sum(1 for s in spots if s.status == 'O')
                results.append({
                    "type": "lot",
                    "lot_id": lot.id,
                    "address": lot.address,
                    "occupied": occupied,
                    "capacity": len(spots),
                    "spots": [{"id": s.id, "is_occupied": s.status == 'O'} for s in spots]
                })

        elif search_type == "spot":
            spot = ParkingSpot.query.get(int(search_query))
            if spot:
                results.append({
                    "type": "spot",
                    "id": spot.id,
                    "lot_id": spot.lot_id,
                    "is_occupied": spot.status == 'O'
                })
        else:
            return jsonify({"message": "Invalid search type"}), 400

        return jsonify(results), 200

    except ValueError:
        return jsonify({"message": "Invalid ID format. Please provide a number."}), 400
    except Exception as e:
        app.logger.error(f"Search error: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500


#  ---- admin summary ------
@app.route("/api/admin/summary", methods=["GET"])
@auth_required('token')
@roles_required('admin')
def admin_summary():
    try:
        lots = ParkingLot.query.all()
        
        total_bill_each_lot = []
        for lot in lots:
            bookings = Bookings.query.filter_by(lot_id=lot.id).all()
            total_bill = sum(booking.bill_amount for booking in bookings)
            total_bill_each_lot.append({
                "lot_id": lot.id,
                "total_amount": total_bill
            })

        parking_lots = []
        for lot in lots:
            available_spots = ParkingSpot.query.filter_by(lot_id=lot.id, status='A').count()
            occupied_spots = lot.total_spots - available_spots
            parking_lots.append({
                "lot_id": lot.id,
                "location": lot.location,
                "available" : available_spots,
                "occupied" : occupied_spots
            })
        
        booking_history = []
        users = User.query.all()
        for user in users:
            if user.id == 1:
                continue
            bookings = Bookings.query.filter_by(user_id=user.id).all()
            b = []
            for i in bookings:
                lot = ParkingLot.query.get(i.lot_id)
                spot = ParkingSpot.query.get(i.spot_id)
                b.append({
                    'location': lot.location if lot else "Unknown",
                    'spot_id': spot.id if spot else 0,
                    'vehicle_number': i.vehicle_number,
                    'start_time': i.start_time.strftime('%Y-%m-%d %H:%M'),
                    'end_time': i.end_time.strftime('%Y-%m-%d %H:%M') if i.end_time else 'Active',
                    'bill_amount': i.bill_amount
                })
            user_data = {
                'name': user.name,
                'email': user.email,
                'total_spent': sum(bill.bill_amount for bill in bookings),
                'bookings':b,
            }
            booking_history.append(user_data)

        return jsonify({
            "bill": total_bill_each_lot,
            "lots": parking_lots,
            "booking_history": booking_history,
        }), 200
    except Exception as e:
        return jsonify({"message": "Error fetching summary", "error": str(e)}), 500


