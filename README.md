# HADSagono

A kids' game based in connecting hexagons. Built using React, Vite, Express, Mongodb, Langchain and Node.js.

## Demo

An instance of the application is hosted at https://hads.nico.eus . Only games with more than 3 movements are saved on the server.

## Self-Hosting

This application is designed to be _built_ and _run_ via docker. An "prebuilt" docker image cannot be provided because some API Keys and other configuration parameters must be tweaked beforehand. It is recommended to have in the machine at least 3GB of storage space and some systems administration knowledge is assumed. These are the steps to self-hosting _hadsagono_:

1. First, clone the repository:
```
git clone https://github.com/Martinh13/HADSagono.git
```
2. _cd_ into the cloned folder.
3. Then, rename the ".env.example" file to ".env"
4. Open the ".env" file with your favourite text editor. You must provide a [groq](https://console.groq.com) API key for the _multiplayer_ feature. You can also configure the exposed web application's port and the username and password of the mongodb database.
5. Install the [docker engine](https://docs.docker.com/engine/install/) into your machine if you already haven't.
6. When you have all the variables configured correctly, you can simply run
```
docker-compose up -d
```
7. Now your application will be running in the port you specified!

### Recommended Steps

8. If you are deploying the application on a server, you'll most likely want to persist the application and have it auto-start automatically when you restart your machine. In the case you're running Linux and manage processes with _systemctl_, you can just execute
```
sudo systemctl enable docker
```

9. It is recommended that you run your web application behind a reverse proxy (like [nginx](https://nginx.org)) so you can protect the application through TLS/SSL and have more control over the web server. An example _nginx_ domain config (to be placed in _/etc/nginx/conf.d/domains/_) for an application running over the port _3456_ at an IP _[MACHINE_IP]_ and with a hostname _[DOMAIN]_
```
server {
        listen      [MACHINE_IP]:443 ssl;
        server_name [DOMAIN] ;
        error_log   /path/to/your/error.log error;

        ssl_certificate     /path/to/ssl/cert.pem;
        ssl_certificate_key /path/to/ssl/cert.key;
        ssl_stapling        on;
        ssl_stapling_verify on;

        # TLS 1.3 0-RTT anti-replay
        if ($anti_replay = 307) { return 307 https://$host$request_uri; }
        if ($anti_replay = 425) { return 425; }

        location ~ /\.(?!well-known\/|file) {
                deny all;
                return 404;
        }

        location / {
                proxy_pass http://127.0.0.0:3456;
        }

        location /error/ {
                alias /wherever/you/have/your/document_errors/;
        }

        proxy_hide_header Upgrade;

        include /path/to/your/nginx.ssl.conf_*;
}
```

## Developer Environment Setup

// TODO