import request from 'request';

class RequestService {
  constructor() {

  }

  /**
  * @param {Object} options - request options (headers, url, method, etc)
  * @return {Promise}
  */
  sendRequest(options) {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject({
            error: "Ok",
            errMessage: error
          });
        } else {
          resolve({ sucess: "Ok", body: response.body });
        }
      });
    });
  }
}

export default RequestService;