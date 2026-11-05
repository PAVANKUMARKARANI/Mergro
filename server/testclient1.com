server {
    listen *:80;
    server_name test.dosystemsinc.com;
    root /var/www/html/test.dosystemsinc.com/;
    index index.html index.htm index.php;

    charset utf-8;
    add_header Strict-Transport-Security max-age=15768000;


    location / {

       if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
      }
      add_header Cache-Control "no-store, no-cache, must-revalidate";
      #try_files $uri $uri/ /index.php$is_args$args;

    }
    #location = /favicon.ico { access_log off; log_not_found off; }
    #location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;

    error_log  /var/log/nginx/myapp-error.log error;

    sendfile off;

    client_max_body_size 100m;

    #ERROR
    # error_page 404 /index.php;
  error_page 404 /index.html;

    #DENY HTACCESS
     location ~ /\.ht {
       deny all;
     }
}
