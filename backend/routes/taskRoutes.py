from flask import current_app as app, request, jsonify, send_from_directory
from celery.result import AsyncResult
from flask_security import auth_required, roles_required, current_user
from ..tasks import csv_report, monthly_report

@app.route('/api/export', methods=['GET'])
@auth_required('token')
@roles_required('user')
def export_csv():
    result = csv_report.delay(user_id=current_user.id)
    return jsonify({
        "id": result.id,
        "result": result.result,
    })
    
@app.route('/api/csv_result/<id>')
def csv_result(id):
    res = AsyncResult(id)
    if not res.ready() or not res.result:
        return jsonify({"message": "CSV not ready"}), 202

    return send_from_directory('static', res.result, as_attachment=True)

@app.route('/api/mail')
def send_reports():
    res = monthly_report.delay()
    return {
        "result": res.result
    }