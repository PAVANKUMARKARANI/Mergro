import pluralize from 'pluralize';
import respUtil from '../utils/resp.util';

import employeeService from '../services/employee.service';

export default async function (req, res, next) {
    let { originalUrl, query, url, ip, method, path, body, hostname, protocol, secure, params } = req;
    let screen = extractEndpoint(path)
    let isError = middlewareInstance.middleware(req, body, method, pluralize.plural(screen.toLowerCase())).init();
    if (isError) {
        req.i18nKey='validationError'
        return res.json(respUtil.getErrorResponse(req));
    } else {
        next();
    }
}

/**@Middleware service for individual screens*/
class middlewareService {
    middleware(req, body, method, screenName) {
    
        let screens = {
            

employees: () => {
    if (method == "POST" || method == "PUT")
        return employeesService.validateFields(req, body)
},


        }

        if (screens[screenName] && typeof screens[screenName] === "function") {
            return {
                init: () => {
                    return screens[screenName]();
                }
            };
        }
        else {
            return {
                init: () => {
                    return false;
                }
            };
        }
    }
}
const middlewareInstance = new middlewareService();


/**@Extract screen name from endpoint */
const extractEndpoint=(path)=> {
    const parts = path.split("/");
    let index = parts.findIndex(x => x == "api")
    return parts[index + 1];
}