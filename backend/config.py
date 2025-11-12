import os

class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class LocalDevelopmentConfig(Config):
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///wheelspot.db')
    
    # for deployment purposes 
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    DEBUG = True
    
    # Security Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'wheelspot-secret-key') 
    SECURITY_PASSWORD = 'bcrypt' 
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'wheelspot-password-salt') 
    WTF_CSRF_ENABLED = False 
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Auth-Token'
    
    # Celery Configuration optional here
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')