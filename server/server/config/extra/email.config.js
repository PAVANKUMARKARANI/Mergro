const mailConfig = {
  mailSettings: {
    adminUrl : 'http://admin.demoproject29.dosystemsinc.com',
serverUrl : 'http://api.demoproject29.dosystemsinc.com',

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