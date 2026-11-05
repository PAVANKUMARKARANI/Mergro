import sgMail from '@sendgrid/mail';
/**Model*/
import settingsModel from '../models/settings.model';
import emailStatusModel from '../models/emailstatus.model';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
class sendGridService {
  constructor() {

  }
  async send({ params, emailStatus }) {
    let settings = await settingsModel.findOne({ active: true });
    if (settings && settings.enableMails) {
      if (settings.sendGridApiKey && settings.sendGridEmail) {
        sgMail.setApiKey(settings.sendGridApiKey);
        params.from = settings.sendGridEmail;
        emailStatus.from = params.from;
        sgMail.send(params, async (err) => {
          if (err) {
            emailStatus.status = "Failed"
            emailStatus.reason = "ERROR"
            await emailStatusModel.saveDetails(emailStatus)
            console.log("EMAIL saved", emailStatus.status, emailStatus.reason)
            console.log('Error', err);
          } else {
            emailStatus.status = "Sent"
            await emailStatusModel.saveDetails(emailStatus)
            console.log("EMAIL STATUS : ", emailStatus.status)
            console.log("Email send successfully")
          }
        });
      } else {
        emailStatus.status = "Failed"
        emailStatus.reason = "Check settings for sendGridApiKey and sendGridEmail"
        await emailStatusModel.saveDetails(emailStatus)
        console.log("EMAIL saved", emailStatus.status, emailStatus.reason)
        console.log("Check settings for sendGridApiKey and sendGridEmail");
      }
    }
    else {
      emailStatus.status = "Failed"
      emailStatus.reason = "Emails disabaled"
      await emailStatusModel.saveDetails(emailStatus)
      console.log("EMAIL saved", emailStatus.status, emailStatus.reason)
      console.log("Emails disabaled")
    }
    await emailStatusModel.saveDetails(emailStatus)
  }
}

export default sendGridService;