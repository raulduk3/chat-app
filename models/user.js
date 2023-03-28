class User {
    constructor(username, email, password, token) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.token = token;
    }
  }
  
  module.exports = { User };
  