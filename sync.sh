rsync -avhP ./ n3:/web/solid-mp3/ \
    --exclude node_modules \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '*.sqlite'

# --exclude 'public/files/*' \

