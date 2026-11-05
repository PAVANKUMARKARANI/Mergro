import sessionUtil from "../utils/session.util";
import respUtil from "../utils/resp.util";
const authorize = (permission, controller) => {
	return (req, res, next) => {
		let permissionsObj = sessionUtil.checkTokenInfo(req, "permissions") ? sessionUtil.getTokenInfo(req, "permissions"): null;
        let permissions = permissionsObj ? permissionsObj.permissions : null;
		let permissionOptions = permission == "View" ? ["Edit", "View"] : permission == "Edit" ? ["Edit"] : [];

		if (permissions && permissions[controller] && permissions[controller].type && permissionOptions.includes(permissions[controller].type)) {
			next();
		}
        else {
            req.i18nKey = "noPermissionErr";
            return res.json(respUtil.getErrorResponse(req));
		}
	};
};
export default authorize;
