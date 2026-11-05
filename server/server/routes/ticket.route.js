import express from 'express';
import ticketCtrl from '../controllers/ticket.controller';
import asyncHandler from 'express-async-handler';
import authPolicy from '../middlewares/authenticate';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/numberOfTicketsByEachEmployee')
	.get(asyncHandler(ticketCtrl.numberOfTicketsByEachEmployee));

router
     .route('/createReplyTicketsForTicket')
	 .all(authPolicy.isAllowed)
	.post(asyncHandler(ticketCtrl.createReplyTicketsForTicket));

router
     .route('/multiDelete')
	 .all(authPolicy.isAllowed)
	.post(asyncHandler(ticketCtrl.multidelete));

router 
    .route('/')
	.all(authPolicy.isAllowed)
	/** POST /api/tickets - Create new tickets */
	.post(asyncHandler(ticketCtrl.create))

router
	.route('/')
	.all(authPolicy.isAllowed)
	/** get /api/tickets -  get all tickets */
	.get(asyncHandler(ticketCtrl.list));

router
    .route('/:ticketId')
	.all(authPolicy.isAllowed)
	/** get /api/tickets -  get one tickets using id*/
	.get(asyncHandler(ticketCtrl.get))

router
    .route('/:ticketId')
	.all(authPolicy.isAllowed)
	/** put /api/tickets -  update tickets */
	.put(asyncHandler(ticketCtrl.update))
    
router
    .route('/:ticketId')
	.all(authPolicy.isAllowed)
	/** delete /api/tickets -  delete tickets */
	.delete(asyncHandler(ticketCtrl.remove));

router.param('ticketId', asyncHandler(ticketCtrl.load));

module.exports = router;
