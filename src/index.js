const uuidv4 = require("uuid/v4");
const moment = require("moment");

/**
 * Attempt to extract the client from the active context
 * @param {object} ctx The Koa context
 */
async function getClient(ctx, Client) {
  let client_id, client_secret;
  if (ctx.request.body && ctx.request.body.client_id) {
    client_id = ctx.request.body.client_id;
  } else if (ctx.request.query && ctx.request.query.client_id) {
    client_id = ctx.request.query.client_id;
  }

  if (ctx.request.body && ctx.request.body.client_secret) {
    client_secret = ctx.request.body.client_secret;
  } else if (ctx.request.query && ctx.request.query.client_secret) {
    client_secret = ctx.request.query.client_secret;
  }

  if (client_id && client_secret) {
    ctx.client = await Client.where({
      client_id,
      client_secret
    }).fetch();

    if (!ctx.client) {
      throw "Invalid client_id or client_secret";
    }
  }
}

module.exports = function(options = {}) {
  if (!options.models) {
    throw "KOAuth2: Models not provided.";
  }

  if (!options.models.user) {
    throw "KOAuth2: User model is required.";
  }

  if (!options.models.token) {
    throw "KOAuth2: Token model is required";
  }

  if (!options.models.client) {
    throw "KOAuth2: Client model is required";
  }

  return {
    required: async function(ctx, next) {
      let tkn = ctx.request.headers.authorization
        ? ctx.request.headers.authorization
            .replace("Bearer ", "")
            .replace("bearer ", "")
        : "";

      if (!tkn.length) {
        ctx.throw(401, "Invalid authorization token");
      }

      let token = await options.models.token
        .where({
          token: tkn
        })
        .fetch();
      if (!token) {
        ctx.throw(401, "Invalid authorization token");
      }

      let user = await options.models.user
        .where({
          id: token.attributes.user_id
        })
        .fetch();
      if (!user) {
        ctx.throw(401, "User not found");
      }

      ctx.token = token;
      ctx.user = user;

      await next();
    },
    middleware: async function(ctx, next) {
      // Attempt to extract the client from context
      await getClient(ctx, options.models.client);

      // Register the token authorization middleware
      ctx.authorize = async function(ctx) {
        let token = await options.models.token
          .where({
            token: ctx.request.token
          })
          .fetch();

        if (!token) {
          throw "ERR_INVALID_TOKEN";
        }

        if (token.expires_at < moment()) {
          token.destroy();
          throw "ERR_TOKEN_EXPIRED";
        }

        let user = await options.models.user
          .where({
            id: token.user_id
          })
          .fetch();

        if (!user) {
          throw "ERR_INVALID_USER";
        }

        return user;
      };

      ctx.login = async function(email, password) {
        if (!ctx.client) {
          throw "Invalid client_id or client_secret";
        }

        let user = await options.models.user.where({ email }).fetch();
        if (!user) {
          throw "ERR_INVALID_EMAIL";
        }

        let authed = user.authenticate(password);
        if (!authed) {
          throw "ERR_INVALID_PASSWORD";
        } else {
          // Generate a new token
          let tkn = uuidv4();
          let token = await options.models.token
            .forge({
              user_id: user.id,
              client_id: ctx.client.id,
              expires_at: moment(3600),
              token: tkn
            })
            .save();

          if (!token) {
            throw "ERR_TOKEN_FAILED";
          }

          let res = {
            access_token: token.attributes.token,
            expires_at: token.attributes.expires_at,
            user_id: user.attributes.id
          };
          return res;
        }

        throw "ERR_UNKNOWN";
      };

      await next();
    }
  };
};
