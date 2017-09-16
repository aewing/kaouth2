const Bookshelf = require("bookshelf");
const Knex = require("knex");
const securePassword = require("bookshelf-secure-password");
const dbConfig = require("./knexfile");

const knex = Knex(dbConfig.development);
const bookshelf = Bookshelf(knex);

bookshelf.plugin("visibility");
bookshelf.plugin(securePassword);

module.exports = {
  bookshelf,
  knex
};
