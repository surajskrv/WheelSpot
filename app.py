from flask import Flask
from backend.extensions import db
from backend.models import User, Role
from backend.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from backend.celery_init import celery_init_app
from celery.schedules import crontab

app = None

def start():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    
    return app
    
app = start()
celery = celery_init_app(app)
celery.autodiscover_tasks()

from backend.create_data import *
from backend.routes.authRoutes import *   
from backend.routes.adminRoutes import *   
from backend.routes.userRoutes import *   
from backend.routes.taskRoutes import *   

@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_report.s(),
    )
    sender.add_periodic_task(
        crontab(minute = '*/5'),
        booking_update_daily.s(),
    )

if __name__ == '__main__':
    app.run()