/**Models*/
import menuListModel from '../models/menulist.model';
/**Services*/
import menulistService from '../services/menulist.service';
import activityService from '../services/activity.service';
/**Utils*/
import respUtil from '../utils/resp.util';
import serviceUtil from '../utils/service.util';
import i18nUtil from '../utils/i18n.util';

const controller = "Menulist";

/**
 * Get menulist
 * @param req
 * @param res
 * @returns {details: Menulist}
 */
async function get(req, res) {
  logger.info('Log:Menulist Controller:get: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  res.json({
    details: req.menulist
  });
}

/**
 * Get menulist list. based on criteria
 * @param req
 * @param res
 * @param next
 * @returns {menulists: menulists, pagination: pagination}
 */
async function list(req, res, next) {
  console.log("reswwwwwwwww", req.tokenInfo.loginType)
  logger.info('Log:Menulist Controller:list: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "View", controller);
  const query = await serviceUtil.generateListQuery(req);
  // if (req.tokenInfo.loginType == "employee") {
  //   query.filter.type = { $in: ["", "admin"] }
  //   // let index = menulists.findIndex(x => x.type === "user");
  //   // menulists.splice(index, 1)
  // } else if (req.tokenInfo.loginType == "user") {
  //   // let index = menulists.findIndex(x => x.title === "Credits");
  //   // menulists.splice(index, 1)
  //   // index = menulists.findIndex(x => x.title === "Invoices");
  //   // menulists.splice(index, 1)
  //   // index = menulists.findIndex(x => x.title === "Bank Details");
  //   // menulists.splice(index, 1)
  //   query.filter.type = { $in: ["", "user"] }
  // }

  if (req.tokenInfo.loginType == "employee") { query.filter.type =  "Admin" }
    // total count 
    query.pagination.totalCount = await menuListModel.totalCount(query);
  
  req.entityType = 'menulist';

  //get total menulists
  const menulists = await menuListModel.list(query);

  console.log("menulistssss", JSON.stringify(menulists))
  res.json({
    menulists: menulists,
    pagination: query.pagination
  });
}


/**
 * Update existing menulist
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function update(req, res, next) {
  logger.info('Log:Menulist Controller:update: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let menulist = req.menulist;
  menulist = Object.assign(menulist, req.body);
  menulist = await menulistService.setUpdateMenulistVaribles(req, menulist);
  req.menulist = await menuListModel.saveData(menulist);
  req.entityType = 'menulist';
  req.activityKey = 'menulistUpdate';

  // adding menulist update activity
  await activityService.insertActivity(req);
  res.json(respUtil.updateSuccessResponse(req));
}

/**
 * Create new menulist
 * @param req
 * @param res
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function create(req, res) {
  logger.info('Log:Menulist Controller:create: body :' + JSON.stringify(req.body));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let menulist = new menuListModel(req.body);
  menulist = await menulistService.setCreateMenulistVaribles(req, menulist);
  req.menulist = await menuListModel.saveData(menulist);
  req.entityType = 'menulist';
  req.activityKey = 'menulistCreate';

  // adding menulist create activity
  await activityService.insertActivity(req);
  res.json(respUtil.createSuccessResponse(req));
}

/**
 * Delete menulist.
 * @param req
 * @param res
 * @param next
 * @returns { respCode: respCode, respMessage: respMessage }
 */
async function remove(req, res, next) {
  logger.info('Log:Menulist Controller:remove: query :' + JSON.stringify(req.query));
  await serviceUtil.checkPermission(req, res, "Edit", controller);
  let menulist = req.menulist;
  menulist.active = false;
  menulist = await menulistService.setUpdateMenulistVaribles(req, menulist);
  req.menulist = await menuListModel.saveData(menulist);
  req.entityType = 'menulist';
  req.activityKey = 'menulistDelete';

  // adding menulist delete activity
  await activityService.insertActivity(req);
  res.json(respUtil.removeSuccessResponse(req));
};

/**
 * Load menulist and append to req.
 * @param req
 * @param res
 * @param next
 */
async function load(req, res, next) {
  req.menulist = await menuListModel.get(req.params.menulistId);
  return next();
}

export default { get, list, update, create, remove, load }