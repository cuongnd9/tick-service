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

function checkCode(req) {
  const {
    query,
    app: {
      locals: { redis },
    },
  } = req;
  return service.checkCode(redis, query);
}

function register(req) {
  return service.register(req.body);
}

function login(req) {
  return service.login(req.body);
}

export default {
  requireCode,
  checkCode,
  register,
  login,
};
