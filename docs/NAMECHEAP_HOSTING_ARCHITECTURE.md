# Namecheap Shared Hosting - Architecture

## 🎯 Hosting Constraints

Namecheap shared hosting typically supports:
- ✅ **PHP** (7.4+, 8.x)
- ✅ **MySQL/MariaDB**
- ✅ **Static files** (HTML, CSS, JS)
- ✅ **cPanel**
- ✅ **.htaccess** configuration
- ❌ **Node.js** (limited or no support)
- ❌ **PostgreSQL**
- ❌ **Background workers**
- ❌ **WebSockets**

## 📋 Adjusted Technology Stack

### **Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (already from Figma)
- **Build**: Static files (HTML, CSS, JS)
- **Deployment**: Upload `dist` folder to `public_html`

### **Backend**
- **Framework**: Laravel 10.x (PHP)
- **Database**: MySQL 8.0
- **API**: RESTful JSON API
- **Authentication**: Laravel Sanctum (JWT)
- **File Storage**: Local storage (shared hosting)

### **Database**
- **Primary**: MySQL 8.0 (via cPanel)
- **Migrations**: Laravel migrations
- **ORM**: Eloquent ORM

## 🏗️ Project Structure

```
/public_html/
├── api/                          # Laravel Backend
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── public/
│       └── index.php            # API entry point
└── app/                          # React Frontend (dist)
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── .htaccess
```

## 🔧 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Namecheap Shared Hosting        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       public_html/              │   │
│  │                                 │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │  app/ (React Frontend)   │  │   │
│  │  │  - Static HTML/CSS/JS    │◄─┼───┼── Users
│  │  │  - Served by Apache      │  │   │
│  │  └────────┬─────────────────┘  │   │
│  │           │ API Calls           │   │
│  │           ▼                     │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │  api/ (Laravel Backend)  │  │   │
│  │  │  - REST API              │  │   │
│  │  │  - PHP 8.x               │  │   │
│  │  └────────┬─────────────────┘  │   │
│  │           │                     │   │
│  │           ▼                     │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │   MySQL Database         │  │   │
│  │  │   (via cPanel)           │  │   │
│  │  └──────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 📁 Folder Structure

### **Development Structure**
```
QA_testing/
├── frontend/                     # React Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Laravel Application
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── config/
│   └── composer.json
└── docs/
```

### **Production Structure (Namecheap)**
```
/public_html/
├── .htaccess                     # Root redirects
├── api/                          # Laravel app
│   ├── .env
│   ├── .htaccess
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   └── index.php
│   ├── routes/
│   ├── storage/
│   └── vendor/
└── app/                          # React build
    ├── index.html
    ├── assets/
    └── .htaccess
```

## 🚀 Deployment Steps

### 1. **Frontend Deployment**
```bash
# Build React app
cd frontend
npm run build

# Upload dist/ contents to /public_html/app/
# via FTP or cPanel File Manager
```

### 2. **Backend Deployment**
```bash
# Prepare Laravel
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Upload to /public_html/api/
# via FTP or cPanel File Manager
```

### 3. **Database Setup**
```
1. Create MySQL database via cPanel
2. Create database user
3. Update .env file with credentials
4. Run migrations via SSH or cPanel Terminal
```

## 🔒 .htaccess Configuration

### **Root .htaccess** (`/public_html/.htaccess`)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # API requests to Laravel
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api/(.*)$ api/public/index.php [L]
    
    # Frontend requests to React
    RewriteCond %{REQUEST_URI} !^/api
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ app/index.html [L]
</IfModule>
```

### **API .htaccess** (`/public_html/api/public/.htaccess`)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    
    # Redirect to front controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### **Frontend .htaccess** (`/public_html/app/.htaccess`)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /app/
    
    # Handle React Router
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
</IfModule>
```

## 🌐 URL Structure

```
Production URLs:
├── Frontend:  https://yourdomain.com/
├── API:       https://yourdomain.com/api/v1/
├── Assets:    https://yourdomain.com/app/assets/
└── Uploads:   https://yourdomain.com/api/storage/uploads/
```

## 📊 Laravel Backend Structure

### **API Routes** (`routes/api.php`)
```php
Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        
        Route::apiResource('test-cases', TestCaseController::class);
        Route::apiResource('test-runs', TestRunController::class);
        Route::apiResource('bugs', BugController::class);
        Route::get('reports/dashboard', [ReportController::class, 'dashboard']);
    });
});
```

### **Database Configuration** (`.env`)
```env
APP_NAME="QA Testing Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

## 🔐 Security Considerations

1. **Hide .env file**
```apache
# In .htaccess
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

2. **Disable directory listing**
```apache
Options -Indexes
```

3. **Protect sensitive directories**
```apache
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

4. **CORS Configuration** (Laravel)
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['https://yourdomain.com'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## 📦 File Upload Handling

```php
// Laravel storage configuration
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/api/storage',
        'visibility' => 'public',
    ],
],
```

## 🚨 Limitations & Workarounds

### **1. No WebSockets**
- **Solution**: Use polling for real-time updates
- Frontend polls API every 30-60 seconds

### **2. No Background Jobs**
- **Solution**: Use cron jobs via cPanel
- Set up Laravel Scheduler

### **3. File Upload Size Limits**
- **Solution**: Configure PHP settings via `.user.ini`
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

### **4. No Redis**
- **Solution**: Use file-based cache
```php
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
```

## 📈 Performance Optimization

1. **Laravel Optimization**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

2. **Frontend Optimization**
```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/*']
      }
    }
  }
}
```

3. **Database Optimization**
- Add indexes to frequently queried columns
- Use eager loading to prevent N+1 queries
- Enable query caching

4. **Apache Optimization**
```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## 🔄 Continuous Deployment

### **Option 1: Manual via FTP**
1. Build locally
2. Upload via FileZilla

### **Option 2: Git Deployment (if supported)**
```bash
# Setup Git on shared hosting
cd /public_html/api
git pull origin main
composer install
php artisan migrate
```

### **Option 3: GitHub Actions + FTP**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Namecheap
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
```

## 💰 Cost Estimation

- **Namecheap Shared Hosting**: $2-5/month
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt via cPanel)
- **Total**: ~$3-6/month

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2025  
**Deployment Target**: Namecheap Shared Hosting

