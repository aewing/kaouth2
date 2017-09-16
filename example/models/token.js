const bookshelf = require("../database").bookshelf;

const Token = bookshelf.Model.extend({
  tableName: "tokens"
});

module.exports = { Token };
