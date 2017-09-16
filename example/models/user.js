const bookshelf = require("../database").bookshelf;

const User = bookshelf.Model.extend({
  tableName: "users",
  hasSecurePassword: true,
  hidden: ["password_digest"]
});

module.exports = { User };
