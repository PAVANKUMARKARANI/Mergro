const config = {
  activityConfig: {
    settingsCreate: {
      context: 'SETTINGS',
      contextType: 'CREATE',
      desc: 'Settings created',
      key: '101'
    },
    settingsUpdate: {
      context: 'SETTINGS',
      contextType: 'UPDATE',
      desc: 'Settings updated',
      key: '102'
    },
    settingsDelete: {
      context: 'SETTINGS',
      contextType: 'DELETE',
      desc: 'Settings deleted',
      key: '103'
    },
    employeeCreate: {
      context: 'EMPLOYEE',
      contextType: 'CREATE',
      desc: 'Employee created',
      key: '151'
    },
    employeeUpdate: {
      context: 'EMPLOYEE',
      contextType: 'UPDATE',
      desc: 'Employee Updated',
      key: '152'
    },
    employeeDelete: {
      context: 'EMPLOYEE',
      contextType: 'DELETE',
      desc: 'Employee deleted',
      key: '153'
    },
    employeeLogoutSuccess: {
      context: 'EMPLOYEE',
      contextType: 'LOGOUT',
      desc: 'Employee logout',
      key: '202'
    },
    employeeLoginSuccess: {
      context: 'EMPLOYEE',
      contextType: 'LOGIN',
      desc: 'Employee login',
      key: '205'
    },
    employeeChangePassword: {
      context: 'EMPLOYEE',
      contextType: 'CHANGEPASSWORD',
      desc: 'EMPLOYEE CHANGEPASSWORD',
      key: '206'
    },
    employeeForgotPassword: {
      context: 'EMPLOYEE',
      contextType: 'FORGOTPASSWORD',
      desc: 'EMPLOYEE FORGOTPASSWORD',
      key: '207'
    },
    roleCreate: {
      context: 'ROLE',
      contextType: 'CREATE',
      desc: 'Role created',
      key: '301'
    },
    roleUpdate: {
      context: 'ROLE',
      contextType: 'UPDATE',
      desc: 'Role updated',
      key: '302'
    },
    roleDelete: {
      context: 'ROLE',
      contextType: 'DELETE',
      desc: 'Role deleted',
      key: '303'
    },
    templatesCreate: {
      context: 'TEMPLATE',
      contextType: 'CREATE',
      desc: 'Templates created',
      key: '401'
    },
    templatesUpdate: {
      context: 'TEMPLATE',
      contextType: 'UPDATE',
      desc: 'Templates Updated',
      key: '402'
    },
    templatesDelete: {
      context: 'TEMPLATE',
      contextType: 'DELETE',
      desc: 'Templates deleted',
      key: '403'
    },
    otpSent:{
      context:"OTP",
      contextType:"SENT",
      desc:"Send OTP",
      key:"1500"
  },
  otpVerificationSuccess:{
      context:"OTP",
      contextType:"VERIFICATION_SUCCESS",
      desc:"Otp Verified Successfully.",
      key:"1525"
  },
  otpVerficationFailed:{
      context:"OTP",
      contextType:"VERIFICATION FAILED",
      desc:"INVALID OTP",
      key:"1550",
  },
  otpExpires:{
      context:"OTP",
      contextType:"OTP EXPIRES",
      desc:"OTP EXPIRES",
      key:"1575"
  },
  failedToSentOtp:{
      context:"OTP",
      contextType:"FAILED TO SENT OTP",
      desc:"FAILED TO SENT OTP",
      key:"1600"
  },
  ticketCreate: {
      context: 'TICKET',
      contextType: 'CREATE',
      desc: 'Ticket created',
      key: '104'
    },
  ticketUpdate: {
      context: 'TICKET',
      contextType: 'UPDATE',
      desc: 'Ticket updated',
      key: '105'
    },
  ticketDelete: {
      context: 'TICKET',
      contextType: 'DELETE',
      desc: 'Ticket deleted',
      key: '106'
    },
  
employeeRegister : {
    context: 'EMPLOYEE',
    contextType: 'REGISTER',
    desc: 'Employee Registerd',
    key: '750'
}

,
employeeMultidelete : {
    context: 'EMPLOYEE',
    contextType: 'MULTIDELETE',
    desc: 'Employee Multideleted',
    key: '436'
}

,
employeeGet : {
    context: 'EMPLOYEE',
    contextType: 'GET',
    desc: 'Employee Getd',
    key: '883'
}

,
employeeList : {
    context: 'EMPLOYEE',
    contextType: 'LIST',
    desc: 'Employee Listd',
    key: '720'
}

,
employeeCreate : {
    context: 'EMPLOYEE',
    contextType: 'CREATE',
    desc: 'Employee Created',
    key: '972'
}

,
employeeUpdate : {
    context: 'EMPLOYEE',
    contextType: 'UPDATE',
    desc: 'Employee Updated',
    key: '962'
}

,
employeeDelete : {
    context: 'EMPLOYEE',
    contextType: 'REMOVE',
    desc: 'Employee Removed',
    key: '433'
}

,
employeeLoginSuccess : {
    context: 'EMPLOYEE',
    contextType: 'LOGINSUCCESS',
    desc: 'Employee LoginSuccessd',
    key: '338'
}

,
employeeChangePassword : {
    context: 'EMPLOYEE',
    contextType: 'CHANGEPASSWORD',
    desc: 'Employee ChangePasswordd',
    key: '786'
}

,
employeeForgotPassword : {
    context: 'EMPLOYEE',
    contextType: 'FORGOTPASSWORD',
    desc: 'Employee ForgotPasswordd',
    key: '516'
}

,
employeeLogoutSuccess : {
    context: 'EMPLOYEE',
    contextType: 'LOGOUTSUCCESS',
    desc: 'Employee LogoutSuccessd',
    key: '935'
}

,
employeeRegister : {
    context: 'EMPLOYEE',
    contextType: 'REGISTER',
    desc: 'Employee Registerd',
    key: '971'
}

,
  },
};

export default config;
