import service from '../services/category.service';

function list(req) {
  return service.getCategoryList({ account: req.user.id, keyword: req.query.keyword });
}

function create(req) {
  return service.createCategory({
    ...req.body,
    account: req.user.id,
  });
}

function update(req) {
  return service.updateCategory({
    ...req.body,
    id: req.params.id,
  });
}

function destroy(req) {
  return service.deleteCategory(req.params.id);
}

export default {
  list,
  create,
  update,
  destroy,
};
