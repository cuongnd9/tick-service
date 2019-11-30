import service from '../services/category.service';

function list(req) {
  return service.getCategoryList({ account: req.user.id });
}

function create(req) {
  return service.createCategory({
    ...req.body,
    account: req.user.id,
  });
}

export default {
  list,
  create,
};
