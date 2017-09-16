exports.up = function(knex, Promise) {
  return knex.schema.createTable("clients", function(table) {
    table.increments("id");
    table.string("client_id");
    table.string("client_secret");
    table.json("options");
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("clients");
};
