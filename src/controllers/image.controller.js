import service from '../services/image.service';

function create(req) {
  return service.createImage(req.files, req.user.id);
}

export default { create };
