# HADSagono

A kids' game about connecting hexagons. Built using React, Vite, Express, Mongodb, Langchain and Node.js.

The entirety of the application was developed for the "Advanced Techniques for Software Development" subject in the third year of the "Computer Engineering" university degree. It contains some very good code, some mediocre code and bunch of horrible, spaguetti code. We're publishing it here for the sake of posterity.

## Screenshot

![Singleplayer mode screenshot](https://i.imgur.com/lMDhwbl.png)
_Figure: Singleplayer mode, a fresh started game_

![Multiplayer mode screenshot](https://i.imgur.com/89JXs8I.png)
_Figure: Multiplayer mode_

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

9. It is recommended that you run your web application behind a reverse proxy (like [nginx](https://nginx.org)) so you can protect the application through TLS/SSL and have more control over the web server. An example _nginx_ domain config (to be placed in _/etc/nginx/conf.d/domains/_) for an application running over the port _3456_ at an IP _[MACHINE_IP]_ and with a hostname _[DOMAIN]_ could be
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

If you want to contribute to the project, you can setup your environment following these steps. The development is done separately from the _frontend_ and the _backend_. If you haven't done so, clone the project and install [node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) in your local development machine. Usually in order to test the whole project you'll need to have two terminals active, one with the frontend development server and the other one with the express backend application.

### Front-End

All the development related to this section happens in the _front_ folder. The used framework is [Vite-React](https://vitejs.dev/) (JavaScript).

- You'll want to open a terminal and execute the following command to install all the needed dependencies
```
npm install -save
```
- The source files of the React frontend are found in the _front/src_ folder.

- To run the development server (it will start, by default in the port 5173), you'll need to enter in the terminal
```
npm run dev
```

### Back-End

For the backend, the application relies on a mongodb database, the express framework and an API key for the GROQ LLM provider.

- First, you'll want to open a terminal and execute the following command to install all node dependencies
```
npm install -save
```
- Then, rename the ".env.example" file to ".env".
- You'll want to get yourself an API Key from the LLM Provider [Groq](https://console.groq.com) and you should insert it in the .env file.
- The application also needs a mongodb database to save the games on. The db MUST have a created database named "hadsagono". The application will create itself three collections: "boards", "boardais" and "backupboards" so make sure there aren't any naming collisions. You must provide a mongo connection URI in the .env file. If you haven't got a mongodb instance, you can [self-host](https://www.mongodb.com/try/download/community) one in your local machine.

- Finally, to run the backend development server (it will start, by default in the port 3642), you'll need to enter in the terminal
```
npm run start
```

### Recommended IDE

You can use whatever IDE you want to develop the project, as the application itself does not need any fancy IDEs. Nevertheless, the development team recomends using [vscode](https://code.visualstudio.com/).
We have published our recommended extensions for vscode for working in the proyect in an [extension pack](https://marketplace.visualstudio.com/items?itemName=nicoagr.hadsagono-vscodeextensions) for your convenience.

## Extra Information

A technical report with all the characteristics of the project can be found in the _technical_report_ file in the source code root. 

## Legal

*This project does NOT have an open-source license. For more information about open source licenses, click [here](https://opensource.org/faq). If you want more information about what does mean to NOT have an open-source license, click [here](https://choosealicense.com/no-permission/)*
