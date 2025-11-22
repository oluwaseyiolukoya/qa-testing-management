# QA Testing Management - Backend API

## Tech Stack
- PHP 8.0+
- MySQL 8.0
- JWT Authentication (using Firebase PHP-JWT)

## Structure

```
backend/
├── config/          # Configuration files
├── src/            
│   ├── Controllers/ # API controllers
│   ├── Models/      # Database models
│   ├── Middleware/  # Authentication middleware
│   └── Utils/       # Helper functions
├── database/        # Migrations and seeds
├── public/          # Public entry point
│   └── index.php    # Main router
├── .htaccess        # Apache configuration
└── composer.json    # Dependencies
```

## Installation

### Local Development
1. Install PHP 8.0+ and MySQL
2. Install Composer: https://getcomposer.org/
3. Run: `composer install`
4. Copy `.env.example` to `.env`
5. Configure database credentials
6. Run migrations: `php database/migrate.php`
7. Start PHP server: `php -S localhost:8000 -t public`

### Namecheap Shared Hosting
1. Upload files via FTP to `/public_html/api/`
2. Create MySQL database via cPanel
3. Update `.env` with database credentials
4. Run migrations via cPanel Terminal or phpMyAdmin
5. Access API at: `https://yourdomain.com/api/`

## API Endpoints
- POST `/api/v1/auth/login` - User login
- GET `/api/v1/auth/me` - Get current user
- GET `/api/v1/test-cases` - List test cases
- POST `/api/v1/test-cases` - Create test case
- GET `/api/v1/test-runs` - List test runs
- GET `/api/v1/bugs` - List bugs
- GET `/api/v1/reports/dashboard` - Dashboard metrics

## Database
- See `/database/schema.sql` for full schema
- MySQL 8.0+ required
- Uses PDO for database connections

## Authentication
- JWT-based authentication
- Token expires in 1 hour
- Refresh token valid for 7 days

## Deployment
See `/docs/DEPLOYMENT_GUIDE.md` for detailed deployment instructions

