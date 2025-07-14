# 🚗 WheelSpot - Smart Parking Management System

> **A modern, full-stack parking management application built with Flask, Vue.js, and Celery. Real-time parking spot booking, admin control, automated reports, and beautiful email notifications.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.0-green.svg)](https://flask.palletsprojects.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-2.x-brightgreen.svg)](https://vuejs.org/)
[![Celery](https://img.shields.io/badge/Celery-5.5.2-orange.svg)](https://celeryproject.org/)
[![Redis](https://img.shields.io/badge/Redis-6.0.0-red.svg)](https://redis.io/)

A modern, full-stack parking management application built with Flask, Vue.js, and Celery. WheelSpot provides real-time parking spot booking, management, and monitoring capabilities for both users and administrators.

## 🌟 Features

### For Users
- **Real-time Parking Spot Booking**: Find and reserve available parking spots instantly
- **Advance Booking**: Secure parking spots before arrival
- **Vehicle Number Validation**: Automatic validation of Indian vehicle number format
- **Flexible Duration**: Hourly parking with automatic billing
- **Booking History**: Complete history of all parking sessions
- **Cost Preview**: See parking costs before releasing spots
- **User Dashboard**: Personal summary with booking statistics

### For Administrators
- **Parking Lot Management**: Create, update, and delete parking lots
- **Spot Management**: Monitor individual parking spots and their status
- **User Management**: View and manage user accounts
- **Real-time Monitoring**: Track occupied and available spots
- **Analytics Dashboard**: Comprehensive system overview and statistics
- **Search Functionality**: Advanced search across users, lots, and bookings

### System Features
- **Role-based Authentication**: Secure admin and user roles
- **Background Tasks**: Automated monthly reports and daily updates
- **Email Notifications**: Monthly parking reports sent to users
- **CSV Export**: Download booking reports in CSV format
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live status updates for parking availability

## 🛠️ Technology Stack

### Backend
- **Flask 3.1.0**: Python web framework
- **Flask-Security-Too**: Authentication and authorization
- **SQLAlchemy**: Database ORM
- **SQLite**: Database (configurable for production)
- **Celery**: Background task processing
- **Redis**: Message broker and result backend

### Frontend
- **Vue.js 2**: Progressive JavaScript framework
- **Vue Router**: Client-side routing
- **Bootstrap 5**: CSS framework for responsive design
- **Chart.js**: Data visualization
- **Bootstrap Icons**: Icon library

### Additional Tools
- **bcrypt**: Password hashing
- **WTForms**: Form handling
- **Flask-CORS**: Cross-origin resource sharing

## 📋 Prerequisites

Before running WheelSpot, ensure you have the following installed:

- **Python 3.8+**
- **Redis Server**
- **pip** (Python package manager)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd WheelSpot
```

### 2. Install Dependencies
in linux or mac or wsl
```bash
pip3 install -r requirements.txt
```
If it is not working use this
```bash
python3 -m pip install -r requirements.txt --break-system-packages
```

### 3. Start Redis Server
```bash
# On Windows
redis-server

# On macOS/Linux
sudo service redis-server start
# or
redis-server
```

### 4. Initialize the Database
The database will be automatically created when you run the application for the first time. Default data includes:
- Admin user: `admin@gmail.com` / `hello@123`
- Sample user: `sam@gmail.com` / `hello@123`

### 5. Run the Application

```bash
# Terminal 1: Start Celery Worker
celery -A app.celery worker --loglevel=info

# Terminal 2: Start Celery Beat (for scheduled tasks)
celery -A app.celery beat --loglevel=info

# Terminal 3: Start Flask App
python app.py

# Termial 4: Start Mailhog server
MailHog
```

### 6. Access the Application
Open your browser and navigate to: `http://127.0.0.1:5000`

## 📁 Project Structure

```
WheelSpot/
├── app.py                      # Main Flask application
├── celery_config.py           # Celery configuration
├── requirements.txt           # Python dependencies
├── README.md                 # This file
├── backend/
│   ├── config.py             # Application configuration
│   ├── extensions.py         # Flask extensions setup
│   ├── models.py             # Database models
│   ├── create_data.py        # Initial data creation
│   ├── tasks.py              # Celery background tasks
│   ├── mail.py               # Email functionality
│   ├── utils.py              # Utility functions
│   └── routes/
│       ├── authRoutes.py     # Authentication routes
│       ├── userRoutes.py     # User-specific routes
│       ├── adminRoutes.py    # Admin-specific routes
│       └── taskRoutes.py     # Task-related routes
├── static/
│   ├── components/           # Vue.js components
│   │   ├── Home.js          # Landing page
│   │   ├── Login.js         # Login component
│   │   ├── Register.js      # Registration component
│   │   ├── UserHome.js      # User dashboard
│   │   ├── UserSummary.js   # User summary
│   │   ├── AdminHome.js     # Admin dashboard
│   │   ├── AdminSearch.js   # Admin search
│   │   ├── AdminSummary.js  # Admin summary
│   │   └── AdminUsers.js    # User management
│   ├── css/                 # Stylesheets
│   ├── image/               # Images and icons
│   └── script.js            # Main Vue.js application
├── templates/
│   ├── index.html           # Main HTML template
│   └── mail_details.html    # Email template
└── instance/
    └── wheelspot.db         # SQLite database
```

## 🔐 Authentication & Authorization

### User Roles
- **User**: Can book parking spots, view history, and manage their bookings
- **Admin**: Full system access including lot management, user management, and analytics

### Default Credentials
- **Admin**: `admin@gmail.com` / `hello@123`

## 🚗 Vehicle Number Format

The system validates Indian vehicle number format:
- Format: `XX XX XX XXXX` (e.g., `DL 01 AB 1234`)
- Where XX = State code + District number
- XX = Letters (1-2 characters)
- XXXX = Numbers (4 digits)

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout

### User Routes
- `GET /api/user/parking/lot/view` - View available parking lots
- `POST /api/user/book/spot/<lotId>` - Book a parking spot
- `GET /api/user/spot/release/preview/<spotId>` - Preview spot release
- `POST /api/user/spot/release/<spotId>` - Release parking spot
- `GET /api/user/spot/history` - View booking history
- `GET /api/user/summary` - User summary dashboard

### Admin Routes
- `GET /api/admin/lot/view` - View all parking lots
- `POST /api/admin/lot/create` - Create new parking lot
- `POST /api/admin/lot/update/<lotId>` - Update parking lot
- `DELETE /api/admin/lot/delete/<lotId>` - Delete parking lot
- `GET /api/admin/users` - View all users
- `DELETE /api/admin/user/delete/<userId>` - Delete user
- `GET /api/admin/search` - Search functionality
- `GET /api/admin/summary` - Admin summary dashboard

## 🔄 Background Tasks

### Scheduled Tasks
- **Monthly Reports**: Sent every 2 minutes (configurable)
- **Daily Updates**: Sent every 5 minutes (configurable)

### Manual Tasks
- **CSV Report Generation**: Download booking reports
- **Email Notifications**: Monthly parking summaries

## 🎨 UI Components

### Landing Page
- Modern hero section with call-to-action
- Feature highlights and statistics
- How-it-works guide
- Responsive design

### User Dashboard
- Available parking lots display
- Booking interface with vehicle validation
- Active bookings management
- Historical data and analytics

### Admin Dashboard
- Comprehensive parking lot management
- Real-time spot monitoring
- User management interface
- Advanced search and filtering
- System analytics and reports

## 🔧 Configuration

### Environment Variables
The application uses a local development configuration by default. For production, consider:

- Setting `SECRET_KEY` to a secure random string
- Using a production database (PostgreSQL, MySQL)
- Configuring proper email settings
- Setting up Redis for production

### Database
- **Development**: SQLite (`wheelspot.db`)
- **Production**: Configure in `backend/config.py`

## 🚀 Deployment

### Local Development
1. Follow the installation steps above
2. Ensure Redis is running
3. Start Celery workers and beat scheduler
4. Run the Flask application

### Production Deployment
1. Set up a production web server (Gunicorn, uWSGI)
2. Configure a production database
3. Set up Redis for production
4. Configure environment variables
5. Set up proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile application (React Native/Flutter)
- Payment gateway integration
- IoT sensor integration for real-time spot detection
- Machine learning for parking demand prediction
- Multi-language support
- Advanced analytics and reporting

---

**WheelSpot** - Making parking smarter, one spot at a time! 🚗✨
