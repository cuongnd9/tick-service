import axios from 'axios';

import config from '../config';

axios.defaults.baseURL = config.imageService.domain;

/**
 *
 * @param {string} url A url from a network.
 * @param {object} options Options to config request.
 * See more option here: https://github.com/axios/axios
 */
function request(url = '', options = {}) {
  const { method = 'get', responseType = 'json', data = {}, ...otherOptions } = options;
  return axios({
    method,
    url,
    responseType,
    data,
    ...otherOptions,
  });
}

export default request;
