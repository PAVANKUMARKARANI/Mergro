const config = {
  errorConfig: {
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
    roleCreate: {
      context: 'Role',
      contextType: 'CREATE',
      desc: 'Role created',
      key: '301'
    },
    roleUpdate: {
      context: 'Role',
      contextType: 'UPDATE',
      desc: 'Role updated',
      key: '302'
    },
    roleDelete: {
      context: 'Role',
      contextType: 'DELETE',
      desc: 'Role deleted',
      key: '303'
    }
  },
};

export default config;
