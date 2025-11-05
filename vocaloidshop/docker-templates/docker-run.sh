#!/bin/bash
# Docker Build and Run Script for Linux/Mac
# VocaloCart Backend

echo "========================================"
echo "VocaloCart Backend - Docker Setup"
echo "========================================"
echo ""

show_menu() {
    echo "Choose an option:"
    echo "1. Build Docker image"
    echo "2. Run with docker-compose (Production)"
    echo "3. Run with docker-compose (Dev with MySQL)"
    echo "4. View logs"
    echo "5. Stop containers"
    echo "6. Rebuild and restart"
    echo "7. Clean up (remove containers)"
    echo "8. Exit"
    echo ""
}

build_image() {
    echo ""
    echo "Building Docker image..."
    docker build -t vocalocart-backend:latest .
    echo ""
    echo "Build complete!"
    read -p "Press enter to continue..."
}

run_prod() {
    echo ""
    echo "Starting backend (Production mode with AWS RDS)..."
    docker-compose -f docker-compose.prod.yml up -d
    echo ""
    echo "Backend started! Check logs with option 4"
    echo "Health check: http://localhost:8081/actuator/health"
    read -p "Press enter to continue..."
}

run_dev() {
    echo ""
    echo "Starting backend + MySQL (Development mode)..."
    docker-compose up -d
    echo ""
    echo "Services started! Check logs with option 4"
    read -p "Press enter to continue..."
}

view_logs() {
    echo ""
    echo "Showing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.prod.yml logs -f backend
}

stop_containers() {
    echo ""
    echo "Stopping containers..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose down
    echo ""
    echo "Containers stopped!"
    read -p "Press enter to continue..."
}

rebuild() {
    echo ""
    echo "Rebuilding and restarting..."
    docker-compose -f docker-compose.prod.yml up -d --build
    echo ""
    echo "Rebuild complete!"
    read -p "Press enter to continue..."
}

cleanup() {
    echo ""
    echo "WARNING: This will remove all containers and images!"
    read -p "Are you sure? (y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker-compose -f docker-compose.prod.yml down -v
        docker-compose down -v
        docker rmi vocalocart-backend:latest
        echo "Cleanup complete!"
    else
        echo "Cleanup cancelled."
    fi
    read -p "Press enter to continue..."
}

while true; do
    show_menu
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1) build_image ;;
        2) run_prod ;;
        3) run_dev ;;
        4) view_logs ;;
        5) stop_containers ;;
        6) rebuild ;;
        7) cleanup ;;
        8) 
            echo ""
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice!"
            ;;
    esac
done
