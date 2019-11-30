import service from '../services/task.service';

function create(req) {
  return service.createTask({
    ...req.body,
    account: req.user.id,
  });
}

export default {
  create,
};
