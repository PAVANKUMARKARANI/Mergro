echo $1 111111111111111
echo $2 22222222222222222222
echo $3 
services=$3
IFS=',' read -r -a result_array <<< "$services"
if [ "$2" = "start" ]; then
    echo uteeeeeeeeejjjjjj
    PATH=" /root/.nvm/versions/node/v22.16.0/bin:$PATH"
     /root/.nvm/versions/node/v22.16.0/bin/pm2 start $1 
    #script_id=$( /root/.nvm/versions/node/v22.16.0/bin/pm2 describe "Admin.${1}App" | grep "script id" | awk -F '│' '{gsub(/^[ \t]+/,"",$3); gsub(/[ \t]+$/,"",$3); print $3}')
    #pm2 start $script_id 

    #echo Looping the UI Serives
    #for element in "${result_array[@]}"
    #do
    #    a_script_id=$( /root/.nvm/versions/node/v22.16.0/bin/pm2 describe "$element.${1}App" | grep "script id" | awk -F '│' '{gsub(/^[ \t]+/,"",$3); gsub(/[ \t]+$/,"",$3); print $3}')
    #    pm2 start $a_script_id
    #done

# Print the extracted script ID (optional)

elif [ "$2" = "stop" ]; then
    echo uteeeeeeeeejjjjjj1111111111111
    PATH=" /root/.nvm/versions/node/v22.16.0/bin:$PATH"
    echo "LOCATION"$PATH
     /root/.nvm/versions/node/v22.16.0/bin/pm2 stop $1
    # /root/.nvm/versions/node/v22.16.0/bin/pm2 stop "Admin.${1}App"

    #echo Looping the UI Serives
    #for element in "${result_array[@]}"
    #do
    #     /root/.nvm/versions/node/v22.16.0/bin/pm2 stop "$element.${1}App"
    #done

fi
