//
//  namesAPI.cc - a microservice demo program
//
// James Skon
// Kenyon College, 2022
//

#include "chatapp.h"

using namespace httplib;
using namespace std;


const int port = 5005;

void addMessage(string username, string message, map<string,vector<string>> &messages) {
	/* iterate through users adding message to each */
	string jsonMessage = "{\"user\":\"" + username + "\",\"message\":\"" + message + "\"}";

	for (auto userMessagePair : messages) {
		username = userMessagePair.first;
		messages[username].push_back(jsonMessage);
	}
}

string getMessagesJSON(string username, map<string,vector<string>> &messages) {
	/* retrieve json list of messages for this user */
	bool first = true;
	string result = "{\"messages\":[";
	
	for (string message :  messages[username]) {
		if (not first) result += ",";
		result += message;
		first = false;
	}
	
	result += "]}";

	messages[username].clear();
	
	return result;
}

int main(void) {

	Server svr;
	
	map<string, Chatroom> rooms;
	map<string, User> userDB;
	set<string, User> activeUsers;
	
	// TODO: Verify current user token
	svr.Get("/", [](const Request & /*req*/, Response &res) {
		res.set_header("Access-Control-Allow-Origin","*");
		res.set_content("Chat API", "text/plain");
	});

	svr.Post(R"(/chat/register/)", [&](const Request& req, Response& res) {
		res.set_header("Access-Control-Allow-Origin","*");
		
		time_t now = time(0);
		string username = req.matches[1];
		string email 	= req.matches[2];
		string password = req.matches[3]; 

		string result;
		vector<string> empty;
		cout << username << " registered." << endl;
		
		// Check if user with this name exists
		if (userDB[username]) {
			result = "{\"status\":\"exists\"}";
		} else {
			// Add user to userrDB map
			userDB.insert(pair<string, User>(username, new User(username, email, password, hash_string(''))));

			result = "{\"status\":\"success\",\"user\":\"" + username + "\"}";
		}
		res.set_content(result, "text/json");
	});

	// svr.Post(R"(/chat/login/)")

	// svr.Get(R"(/chat/send/(.*)/(.*))", [&](const Request& req, Response& res) {
	// 	res.set_header("Access-Control-Allow-Origin","*");

	// 	string username = req.matches[1];
	// 	string message = req.matches[2];

	// 	string result; 

	// 	if (!messages.count(username)) {
	// 		result = "{\"status\":\"baduser\"}";
	// 	} else {
	// 		addMessage(username,message,messages);
	// 		result = "{\"status\":\"success\"}";
	// 	}
	// 		res.set_content(result, "text/json");
	// 	});

	// 	svr.Get(R"(/chat/fetch/(.*))", [&](const Request& req, Response& res) {
	// 	string username = req.matches[1];
	// 	res.set_header("Access-Control-Allow-Origin","*");
	// 	string resultJSON = getMessagesJSON(username,messages);
	// 	res.set_content(resultJSON, "text/json");
	// });

	cout << "Server listening on port " << port << endl;
	svr.listen("0.0.0.0", port);
}
