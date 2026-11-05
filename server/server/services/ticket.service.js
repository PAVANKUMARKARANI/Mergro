/**Util*/
import sessionUtil from '../utils/session.util';
/**
 * set orders variables
 * @returns {orders}
 */
const setCreateTicketVaribles = (req, ticket) => {
	if (ticket.category === 'Finance') {
		ticket.ticketId = 'F' + parseInt(ticket.ticketNumber);
	} else if (ticket.category === 'Technical') {
		ticket.ticketId = 'T' + parseInt(ticket.ticketNumber);
	} else if (ticket.category === 'Support') {
		ticket.ticketId = 'S' + parseInt(ticket.ticketNumber);
	}

	if (sessionUtil.checkTokenInfo(req, '_id')) {
		if (sessionUtil.getTokenInfo(req, 'loginType') === 'user') {
			ticket.createdBy.user = sessionUtil.getTokenInfo(req, '_id');
			ticket.userId = sessionUtil.getTokenInfo(req, '_id');
			ticket.userName = sessionUtil.getTokenInfo(req, 'displayName');
			ticket.createdByName = session.getSessionLoginName(req);
			ticket.email = sessionUtil.getTokenInfo(req, 'email');
			if (sessionUtil.getTokenInfo(req, 'crmAddress') && sessionUtil.getTokenInfo(req, 'crmAddress').country) {
				ticket.country = sessionUtil.getTokenInfo(req, 'crmAddress').country;
			} else {
				ticket.country = '';
			}
		}
		if (sessionUtil.getTokenInfo(req, 'loginType') === 'employee') {
			ticket.createdBy.employee = sessionUtil.getTokenInfo(req, '_id');
			ticket.userId = sessionUtil.getTokenInfo(req, '_id');
			ticket.userName = sessionUtil.getTokenInfo(req, 'displayName');
			ticket.createdByName = session.getSessionLoginName(req);
			ticket.emailId = sessionUtil.getTokenInfo(req, 'email');
		}
	}
	ticket.created = new Date();
	return ticket;
}

export default {
	setCreateTicketVaribles
};