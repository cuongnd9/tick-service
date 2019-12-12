import Boom from '@hapi/boom';

export default function authorize(...allowed) {
  const isAllowed = role => allowed.indexOf(role) > -1;
  return (req, res, next) => {
    if (req.user && isAllowed(req.user.role)) {
      next();
    } else {
      next(Boom.forbidden('Your role is not allowed'));
    }
  };
}
