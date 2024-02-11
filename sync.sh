rsync -avhP ./ n3:/web/pingpong/ --exclude node_modules  --exclude 'dist' --exclude pingpong.db* --exclude sessions.db*
#--exclude 'public/files/*' --exclude '.env'
ssh n3 "cd /web/pingpong && npm run build"
