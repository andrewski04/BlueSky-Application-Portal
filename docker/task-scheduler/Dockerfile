FROM alpine:latest

RUN apk add --no-cache curl tzdata

COPY scripts/db-cleanup.sh /app/cleanup-script.sh
RUN chmod +x /app/cleanup-script.sh

# run every 1 hour
RUN echo "0 */1 * * * /app/cleanup-script.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

RUN touch /var/log/cron.log

# properly start and stop container
RUN echo '#!/bin/sh\ntrap "exit 0" TERM INT\ncrond -f -l 2 & tail -f /var/log/cron.log & wait' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]