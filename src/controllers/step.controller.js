import service from '../services/step.service';

function updateStatus(req) {
  return service.updateStatus({
    id: req.params.id,
    status: req.body.status,
  });
}

export default {
  updateStatus,
};
