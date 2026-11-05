import otpVerficationModel from '../models/otpVerification.model';
import twilio, { Twilio } from "twilio";
import Nexmo from "nexmo";
import { TaskQueueRealTimeStatisticsContextImpl } from "twilio/lib/rest/taskrouter/v1/workspace/taskQueue/taskQueueRealTimeStatistics";

// SMS provider credentials and the sender number come from server/.env (see .env.example).
const smsFromNumber = process.env.SMS_FROM_NUMBER;
const region = "ap1";
const baseUrl = `https://api.${region}.twilio.com`;

async function sendSMS({smsProvider,...otpObj}) {
	if(smsProvider && smsProvider === "twilio"){
		return await twilioSmsService(otpObj);
	}
	else{
		return await nexmoSmsService(otpObj);
	}
};


async function createOtpVerification(otpModelObj){
	let createOtpVerfication = new otpVerficationModel(otpModelObj);
	await otpVerficationModel.saveData(createOtpVerfication);
}

async function nexmoSmsService({to,message}){
	const nexmo = new Nexmo({
		apiKey: process.env.NEXMO_API_KEY,
		apiSecret: process.env.NEXMO_API_SECRET
	});
	return new Promise((resolve, reject) => {
		nexmo.message.sendSms(
			smsFromNumber,
			`+91${to}`,          //phone number you want to send.
			 message,     //write the message you want to send.
			(err, result) => {
				if (err) {
					console.log("ERR",err)
					reject(err);
				} else {
					console.log("Message sent successfully.");
					console.log(result)
					if (result.messages[0]['status'] === "0") {
						resolve({
							success: 'OK'
						});
					}
				}
		})
	})
}

async function twilioSmsService({from,to,message}){
	const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, { api: { baseUrl: baseUrl } });
    return new Promise((resolve,reject) => {
        twilioClient.messages.create({
            body:message,
            from:smsFromNumber,
            to:`+91${to}`
        },(err,result)=>{
            if(err){
                console.log("ERR",err);
                reject({
                    failed:true
                })
            }
            else{
                resolve({
                    success:true
                })
                console.log("Sms sent successfully")
                return true;
            }
        })
    })
}


export default {
	sendSMS,
	createOtpVerification
}