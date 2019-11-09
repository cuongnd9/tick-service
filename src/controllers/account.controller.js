import service from '../services/account.service';

function requireCode(req) {
  const {
    query,
    app: {
      locals: { redis },
    },
  } = req;
  return service.requireCode(redis, query);
}

function register(req) {
  const {
    query,
    body,
    app: {
      locals: { redis },
    },
  } = req;
  return service.register(redis, query, body);
}

function login(req) {
  return service.login(req.body);
}

export default {
  requireCode,
  register,
  login,
};
