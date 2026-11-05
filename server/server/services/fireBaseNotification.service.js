import admin from 'firebase-admin'
import serviceAcc from '../firebaseToken.json';
//import SendRequestService from './sendRequest.service';

// const key = 'AAAAi0nFeps:APA91bE8jULkhksgplrdqBTwbosARI3P2detrL4PJuZNnxOaXhUKqH9uHsyxOzvwhmfHls5mCTcV5VXYx51kc_ARuL-Vb6HFIGVc2XZs8ikR1R1QTy_xyuQGBSf_xlxZWj1TibtGv5mr';
// const project_id = '598238132891'
// const sendRequestService = new SendRequestService();
admin.initializeApp({
  credential: admin.credential.cert(serviceAcc),
  databaseURL: "https://med-assistant-be4f5.firebaseio.com"
});

class firebaseNoficationService {
  constructor() {

  }

  async sendNotifications(params, req) {
    if (params.registrationTokens && params.payload) {
      // let requestOptions = {
      //   uri: "https://fcm.googleapis.com/fcm/notification",
      //   method: "POST",
      //   body: {
      //     "operation": "create",
      //     "notification_key_name": `appUser-${name}`,
      //     "registration_ids": params.registrationTokens,
      //     "Authorization": `Key=${key}`,
      //     "project_id": project_id
      //   }
      // }
      var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      }
      for (let val of params.registrationTokens) {
        admin.messaging().sendToDevice(val, params.payload, options)
          .then(function (response) {
            console.log('successfully sent message: ', response);
          })
          .catch(function (error) {
            console.log('error sending message : ', error)
          })
      }
    }
  }
}

export default firebaseNoficationService