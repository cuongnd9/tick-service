import service from '@/services/account.service';

function register(req) {
  const {
    body,
    app: {
      locals: { redis },
    },
  } = req;
  return service.register(redis, body);
}

function checkCodeConfirmation(req) {
  const {
    query,
    app: {
      locals: { redis },
    },
  } = req;
  return service.checkCodeConfirmation(redis, query);
}

function login(req) {
  return service.login(req.body);
}

export default {
  register,
  checkCodeConfirmation,
  login,
};
