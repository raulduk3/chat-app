# MakeFile for restChat
# server using Nodejs 
# sudo mkdir /var/www/html/restChat
# sudo chown ubuntu /var/www/html/restChat

all: PutHTML 

PutHTML:
	-rm -r /var/www/html/restChat/*
	cp -r dist/* /var/www/html/restChat/
	
	echo "Current contents of your HTML directory: "
	ls -l /var/www/html/restChat/

