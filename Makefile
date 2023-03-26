# MakeFile for chat-app
# server using MariaDB, express, and socket.io 
# sudo mkdir /var/www/html/chat-app
# sudo chown ubuntu /var/www/html/chat-app

.default: all

all: build

setup:
	-mkdir /var/www/html/chat-app
	-mkdir /var/www/html/chat-app/css
	-mkdir /var/www/html/chat-app/img
	-mkdir /var/www/html/chat-app/js
	-sudo chown ubuntu /var/www/html/chat-app

clean:
	-rm -r /var/www/html/chat-app

build: 
	cp -r ./css/* /var/www/html/chat-app/css/
	cp -r ./js/* /var/www/html/chat-app/js/

	cp -r ./dist/* /var/www/html/chat-app/
	
	echo "Current contents of your HTML directory: "
	ls -l /var/www/html/chat-app/
