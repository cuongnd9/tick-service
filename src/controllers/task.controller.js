import service from '../services/task.service';

function list(req) {
  return service.getTaskList(req.user.id);
}

function create(req) {
  return service.createTask({
    ...req.body,
    account: req.user.id,
  });
}

function update(req) {
  return service.updateTask({
    ...req.body,
    id: req.params.id,
    account: req.user.id,
  });
}

export default {
  list,
  create,
  update,
};
