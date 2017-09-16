const bookshelf = require("../database").bookshelf;

const Client = bookshelf.Model.extend({
  tableName: "clients"
});

module.exports = { Client };
