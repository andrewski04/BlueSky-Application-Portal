#!/bin/sh
echo "Running database cleanup at $(date)"
# this will need to be changed to `172.17.0.1` on docker linux or `localhost` on host
curl -X POST http://host.docker.internal:5173/api/util/cleanup -H "Authorization: Bearer ${CLEANUP_API_KEY}" -s
echo "\nCleanup complete"
