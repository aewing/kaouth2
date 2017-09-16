exports.up = function(knex, Promise) {
  return knex.schema.createTable("tokens", function(table) {
    table.increments("id");
    table.string("token");
    table.integer("user_id").unsigned();
    table.integer("client_id").unsigned();
    table.timestamp("expires_at");
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("tokens");
};
