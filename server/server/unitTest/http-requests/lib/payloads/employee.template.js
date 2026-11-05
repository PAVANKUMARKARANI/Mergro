function EmployeePayload() {
  return {
    getLoginEmployee(employee) {
      return {
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType(),
      };
    },

    getPostEmployee(employee) {
      let { name, email, address, role, phone, created, updated } =
        employee.getfields();
      return {
        name,
        email,
        address,
        role,
        phone,
        created,
        updated,
      };
    },
  };
}

export default EmployeePayload;
