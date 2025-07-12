class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    
class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///wheelspot.db'
    DEBUG = True
    
    # Security configuration
    SECRET_KEY = 'wheelspot-secret-key' # hash user credentials in session
    SECURITY_PASSWORD = 'bcrypt' # Mechanism for password hashing
    SECURITY_PASSWORD_SALT = 'wheelspot-password-salt' # help in password hashing
    WTF_CSRF_ENABLED = False # Disable CSRF protection for testing
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Auth-Token' # Use token authentication