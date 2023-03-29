class Chatroom {
    constructor(name, users) {
      this.name = name;
      this.users = new Set(users);
      this.messages = [];
    }
  }
  
  module.exports = { Chatroom };
  