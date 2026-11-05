import express from 'express';
import menulistCtrl from '../controllers/menulist.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router();

router.route('/:menulistId').all(authPolicy.isAllowed)
  /** get /api/menulists/menulistId -  get one menulist using id*/
  .get(asyncHandler(menulistCtrl.get))

router.route('/').all(authPolicy.isAllowed)
  /** get /api/menulists -  get all menulists */
  .get(asyncHandler(menulistCtrl.list));

router.route('/:menulistId').all(authPolicy.isAllowed)
  /** get /api/menulists/menulistId -  get one menulist using id*/
  .put(asyncHandler(menulistCtrl.update));

router.route('/').all(authPolicy.isAllowed)
  /** POST /api/menulists - Create new menulists */
  .post(asyncHandler(menulistCtrl.create))

router.route('/:menulistId').all(authPolicy.isAllowed)
  /** get /api/menulists/menulistId -  get one menulist using id*/
  .delete(asyncHandler(menulistCtrl.remove));

router.param('menulistId', asyncHandler(menulistCtrl.load));

// export default router;
module.exports = router