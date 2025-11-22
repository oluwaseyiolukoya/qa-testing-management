#!/bin/bash

echo "🚀 Starting QA Testing Management Tool Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any existing servers
echo "📦 Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null
pkill -f "php.*8000" 2>/dev/null
sleep 1

# Start Frontend
echo -e "${BLUE}Frontend:${NC} Starting React dev server..."
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started${NC} (PID: $FRONTEND_PID)"
echo "   URL: http://localhost:5173"
cd ..

# Check if PHP is available
if command -v php &> /dev/null; then
    echo ""
    echo -e "${BLUE}Backend:${NC} Starting PHP server..."
    cd backend
    php -S localhost:8000 -t public > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started${NC} (PID: $BACKEND_PID)"
    echo "   URL: http://localhost:8000/api/v1"
    cd ..
else
    echo ""
    echo -e "${BLUE}Backend:${NC} PHP not found. Install PHP to start backend:"
    echo "   brew install php"
    echo "   or use XAMPP/MAMP"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Servers are running!"
echo ""
echo "Frontend: http://localhost:5173"
if command -v php &> /dev/null; then
    echo "Backend:  http://localhost:8000/api/v1"
fi
echo ""
echo "To stop servers, run:"
echo "  pkill -f vite"
echo "  pkill -f 'php.*8000'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

