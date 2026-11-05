server {
#    listen *:80;
     listen 80;
#     listen [::]:80;
    server_name api.demoproject29.dosystemsinc.com;
    root /var/www/api.demoproject29.dosystemsinc.com/server;
    index index.html index.htm index.php;
    
    charset utf-8;
    add_header Strict-Transport-Security max-age=15768000;
    
    location / {
       
       if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
      }
      
      #try_files $uri $uri/ /index.php$is_args$args;
       proxy_pass http://localhost:2282;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
       proxy_buffering off;
       proxy_redirect off;
    }
    #location = /favicon.ico { access_log off; log_not_found off; }
    #location = /robots.txt  { access_log off; log_not_found off; }
    
    access_log off;
    
    error_log  /var/log/nginx/myapp-error.log error;
    
    sendfile off;
    
    client_max_body_size 100m;
    
    #ERROR
    # error_page 404 /index.php;
    
    #DENY HTACCESS
     location ~ /\.ht {
        deny all;
     }
}
