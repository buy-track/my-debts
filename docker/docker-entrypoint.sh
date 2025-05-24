#!/bin/bash

set -xe

chown -R www-data:www-data ./storage/logs

# apache2-foreground
# /usr/bin/supervisord -c /etc/supervisord.conf

if [ "$CONTAINER_ROLE" == "apache2" ]; then
    echo "Running Laravel migrations..."
#    php /var/www/html/artisan migrate --force

    echo "Clearing Laravel cache..."
    # php /var/www/html/artisan optimize:clear
    php /var/www/html/artisan storage:link
    php /var/www/html/artisan config:cache
    php /var/www/html/artisan route:cache
    php /var/www/html/artisan view:cache

    echo "Starting Apache2 service..."
    exec apache2-foreground

elif [ "$CONTAINER_ROLE" == "queue" ]; then
    echo "Starting Laravel Queue Worker..."
    exec /usr/bin/supervisord -c /etc/supervisord.conf

elif [ "$CONTAINER_ROLE" == "schedule" ]; then
    echo "Starting Laravel Scheduler..."
    while [ true ]
    do
        php /var/www/html/artisan schedule:run --verbose --no-interaction &
        sleep 60
    done

elif [ "$CONTAINER_ROLE" == "admin" ]; then
    echo "Clearing Laravel cache..."
    php /var/www/html/artisan optimize:clear
    php /var/www/html/artisan storage:link
    php /var/www/html/artisan config:cache
    php /var/www/html/artisan route:cache
    php /var/www/html/artisan view:cache

    echo "Starting Apache2 service..."
    exec apache2-foreground

else
    echo "Please set the CONTAINER_ROLE environment variable to one of: apache2, queue, schedule, admin"
    exit 1
fi
