#!/bin/bash

BTRADELOC="serverpath"
BUILDLOC=prod

if [ "$1" = "test" ]; then
   echo "Uploading to finex system.."
   #live server 1
   #PEMFILE=~/Downloads/bitsolives.pem
   TARGETSERVER= 'server'
elif [ "$1" = "live" ]; then
   echo "Uploading to live system.."
   #live server 1
   #PEMFILE=~/Downloads/bitsolives.pem
   TARGETSERVER= 'server'
elif [ "$1" = "-h" ]; then
   echo "Usage : serverbuild.sh [test|live]"
   exit
else
   echo "Invalid argument"
   exit 1
fi

DATE=`date +%Y-%m-%d-%H-%M`

cd $BTRADELOC
 
tar -czf ~/Downloads/server.tar.gz server --exclude "server/config"  --exclude "server/upload"
if [ "$1" = "finex" ]; then
   scp ~/Downloads/server.tar.gz $TARGETSERVER:~/
   ssh $TARGETSERVER "cd /var/www/html/path; sudo tar -czf ~/server$DATE.tar.gz server --exclude client/img; sudo tar -xzf ~/btrserver.tar.gz;"
elif [ "$1" = "live" ]; then
    scp -P 2020 ~/Downloads/server.tar.gz $TARGETSERVER:~/
    ssh -p 2020 $TARGETSERVER "cd /var/www/path/; sudo tar -czf ~/server$DATE.tar.gz server --exclude client/img --exclude server/upload; sudo tar -xzf ~/btrserver.tar.gz; cp /var/www/config/config.js /var/www/cfxapi/server/config/; cp /var/www/config/email.config.js /var/www/config/bitCred.config.js /var/www/cfxapi/server/config/extra/"
fi
echo "Successfully uploaded server"


