# restChatCpp
A REST based web chat program using Node.js (express & socket.io)
## Requires node

## Set up (run from directory)
 - ```sudo mkdir /var/www/html/restChat/```
 - ```sudo chown ubuntu /var/www/html/restChat/```
 - ```sudo npm install```
 - ```npm install -g forever```

## Make and run
 - ```make```
 - ```forever start -o chatapp.log -e error.log ./server.js```

## Go to your VM URL/restChat/
