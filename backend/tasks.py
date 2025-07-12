from celery import shared_task
from .models import User, Bookings, ParkingLot, ParkingSpot
from .utils import format_report
from .mail import send_email
import datetime, csv, json, requests


@shared_task(ignore_results=False, name="download_csv_report")
def csv_report(user_id):
    bookings = Bookings.query.filter_by(user_id=user_id).all()
    csv_file_name = f"booking_{datetime.datetime.now().strftime('%f')}.csv"

    with open(f'static/{csv_file_name}', 'w', newline="") as csvfile:
        sr_no = 1
        writer = csv.writer(csvfile)
        writer.writerow(['Sr No.','Name', 'Vehicle Number', 'Parking In', 'Parking Out', 'Bill Amount'])
        
        for b in bookings:
            writer.writerow([
                sr_no,
                User.query.get(b.user_id).name,
                b.vehicle_number,
                b.start_time.strftime('%Y-%m-%d %H:%M'),
                b.end_time.strftime('%Y-%m-%d %H:%M') if b.end_time else 'Active',
                b.bill_amount
            ])
            sr_no += 1

    return csv_file_name

@shared_task(ignore_results=False, name="monthly_report")
def monthly_report():
    users = User.query.all()
    
    for user in users:
        if user.id == 1: 
            continue
        bookings = Bookings.query.filter_by(user_id=user.id).all()
        user_data = {
            'name': user.name,
            'email': user.email,
            'total_spent': sum(b.bill_amount for b in bookings),
            'bookings': []
        }

        for b in bookings:
            lot = ParkingLot.query.get(b.lot_id)
            spot = ParkingSpot.query.get(b.spot_id)
            booking = {
                'location': lot.location if lot else "Unknown",
                'spot_id': spot.id if spot else 0,
                'vehicle_number': b.vehicle_number,
                'start_time': b.start_time.strftime('%Y-%m-%d %H:%M'),
                'end_time': b.end_time.strftime('%Y-%m-%d %H:%M') if b.end_time else 'Active',
                'bill_amount': b.bill_amount or 0
            }
            user_data['bookings'].append(booking)

        message = format_report('templates/mail_details.html', user_data)
        send_email(
            user.email,
            subject="Monthly Parking Report - WheelSpot",
            message=message
        )
    return "Monthly reports sent to all users"

@shared_task(ignore_results = False, name = "booking_update_daily")
def booking_update_daily():
    users = User.query.all()
    for user in users:
        if user.id == 1:
            continue
        text = f"Hello {user.name}, Check out new Parking Lots. Please check the app at http://127.0.0.1:5000"
        response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAUkWqlaE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=rf2dx-7ImweS8u-7TfU1ayBxp_r1x0nWFM68BmToX30", json = {"text": text})
        print(response.status_code)
    return "Parking update sent to users"
