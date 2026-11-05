const mailConfig = {
  mailSettings: {
    // Web page that handles /changeRecoverPassword/:enEmail?token=… links (set WEB_APP_URL in server/.env).
    adminUrl : process.env.WEB_APP_URL || 'http://localhost:3000',
serverUrl : process.env.API_URL || 'http://localhost:2282',

    websiteName: 'project',
    mailType: 'smtp',
    activateMails: true,
    from: 'projectname <email>',
    smtpOptions:{
        },
    gmailOptions: {
      service: 'Gmail',
      auth: {
        user: 'email', // Your email id
        pass: 'password' // Your password
      }
    },
    sesEmailSettings: {
      key: 'xxxxxxxxxxxxxx',
      secret: 'xxxxxxxxxxxxxxxxxxxxxx'
    }
  }
};

export default mailConfig;