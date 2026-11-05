

function UserPayload() {
  return {
    getLoginUser(user) {
      return {
        email: user.getEmail(),
        password: user.getPassword(),
        entityType: user.getEntityType(),
      }
    },

    getPostUser(user) {
      return {
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        email: user.getEmail(),
        phone: user.getPhone()
      }
    },
  };
}


export default UserPayload;
