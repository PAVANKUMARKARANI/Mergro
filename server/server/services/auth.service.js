import userModel from '../models/user.model';
import employeeModel from '../models/employee.model';


export default {
  auth: ["User", "Employee"],
  getAuthModel: (type) => {
    return
  },
  userModel, employeeModel
}