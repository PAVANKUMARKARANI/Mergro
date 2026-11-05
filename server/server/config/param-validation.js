
const { check, validationResult, param, query } = require('express-validator');


exports.validate = async (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}



exports.validateCheck = (method) => {

  switch (method) {
    case 'login': {
      return [
        check('email').isEmail().withMessage('Please provide email'),
        check('password', 'please provide password in body').exists(),
        check('entityType', 'please provide entityType in body').exists()

      ]
    }

    case 'forgotPassword': {
      return [
        check('entityType', 'please send EntityType in body').exists(),
        query('email', 'please send email in query').exists(),
      ]
    }

    case 'changePassword': {
      return [
        check('currentPassword', 'please provide currentPassword in body').exists(),
        check('newPassword', 'please provide newPassword in body').exists(),
        check('confirmPassword', 'please provide confirmPassword in body').exists(),
      ]
    }

    case 'changeRecoveryPassword': {
      return [
        check('enEmail', 'please provide enEmail in body').exists(),
        check('newPassword', 'please provide newPassword in body').exists(),
        check('confirmPassword', 'please provide confirmPassword in body').exists(),
        check('entityType', 'please provide entityType in body').exists(),

      ]
    }
    case 'upload': {
      return [
        check('uploadPath', 'please provide uploadPath in body').exists(),
      ]
    }

    case 'createEmployee': {
      return [
        check('email', 'please provide email in body').exists(),
        check('firstName', 'please provide firstName in body').exists(),
        check('lastName', 'please provide lastName in body').exists(),
      ]
    }

    case 'updateEmployee': {
      return [
        check('email', "email can't be updated").not().exists(),
      ]
    }

    case 'createUser': {
      return [
        check('email', 'please provide email in body').exists(),
        check('firstName', 'please provide firstName in body').exists(),
        check('lastName', 'please provide lastName in body').exists(),
      ]
    }

    case 'signUp': {
      return [
        check('email', 'please provide email in body').exists(),
        check('firstName', 'please provide firstName in body').exists(),
        check('lastName', 'please provide lastName in body').exists(),
        check('password', 'please provide password in body').exists(),
        check('confirmPassword', 'please provide confirmPassword in body').exists(),
      ]
    }

    case 'updateUser': {
      return [
        check('email', "email can't be updated").not().exists(),
      ]
    }
  }
}