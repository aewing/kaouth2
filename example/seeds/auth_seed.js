const User = require("../models/user").User;

exports.seed = function(knex, Promise) {
  return knex("users")
    .del()
    .then(function() {
      // Inserts seed entries
      return User.forge({
        email: "contact@aewing.io",
        password: "password"
      })
        .save()
        .then(function() {
          return knex("clients")
            .del()
            .then(function() {
              return knex("clients").insert([
                {
                  id: 1,
                  client_id: "test",
                  client_secret: "test",
                  options: {
                    redirect_url: "/"
                  }
                }
              ]);
            });
        });
    });
};
