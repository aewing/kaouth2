const uuid = require("uuid/v4");
const moment = require("moment");

/**
 * Attempt to extract the client from the active context
 * @param {object} ctx The Koa context
 */
async function getClient(ctx, Client) {
  let client_id, client_secret;
  if (ctx.request.body.client_id) {
    client_id = ctx.request.body.client_id;
  } else if (ctx.query.client_id) {
    client_id = ctx.query.client_id;
  }

  if (ctx.request.body.client_secret) {
    client_secret = ctx.request.body.client_secret;
  } else if (ctx.query.client_secret) {
    client_secret = ctx.query.client_secret;
  }

  if (client_id && client_secret) {
    ctx.client = await Client.where({
      client_id,
      client_secret
    }).fetch();

    if (!ctx.client) {
      ctx.body = "Invalid client_id or client_secret";
      return;
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

  return async (ctx, next) => {
    // Attempt to extract the client from context
    getClient(ctx, options.models.client);

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
        ctx.body = "Invalid client_id or client_secret";
        return;
      }

      let user = await options.models.user.authenticate(email, password);

      if (!user) {
        throw "ERR_INVALID_CREDENTIALS";
      } else {
        // Generate a new token
        let tkn = uuidv4();
        let token = await options.models.token.forge({
          user_id: user.id,
          client_id: client.id,
          expires_at: moment(3600),
          token: tkn
        });

        if (!token) {
          throw "ERR_TOKEN_FAILED";
        }

        return { user, token };
      }

      throw "ERR_UNKNOWN";
    };
  };
};
