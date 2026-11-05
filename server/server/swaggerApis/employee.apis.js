/**@component for employee login*/
/**
 * @swagger
 * components:
 *   schemas:
 *     employeeLoginInput:
 *       type: object
 *       example:
 *         email: employee@yopmail.com
 *         password: yourpassword
 *         entityType: employee  
 */

/**@component for employee loginResponse*/
/**
 * @swagger
 * components:
 *   schemas:
 *     employeeloginResponse:
 *       type: object
 *       example:
 *         respCode: 200
 *         respMessage: Successfully logged in.
 *         accessToken: 1234t
 *         refreshToken: 13245
 *         password: yourpassword
 *         entityType: employee  
 *         details: employeedetails
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     employeeLogoutResponse:
 *       type: object
 *       example:
 *         respCode: 200
 *         respMessage: logout successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeForgotPasswordInput:
 *       type: object
 *       example:
 *         entityType: employee  
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeForgotPasswordResponse:
 *       type: object
 *       properties:
 *         respCode:
 *           type: integer
 *           example: 200
 *           description: HTTP status code
 *         respMessage:
 *           type: string
 *           example: "Mail sent successfully"
 *           description: Message confirming password reset initiation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeCreateChangeRecoveryPasswordInput:
 *       type: object
 *       example:
 *         enEmail: encoded email from forgot password
 *         entityType: employee  
 *         newPassword: newpassword
 *         confirmPassword: confirmpassword
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeChangeRecoveryPasswordResponse:
 *       type: object
 *       properties:
 *         respCode:
 *           type: integer
 *           example: 200
 *           description: HTTP status code
 *         respMessage:
 *           type: string
 *           example: "Password created successfully."
 *           description: Message confirming password reset initiation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeCreateChangePasswordInput:
 *       type: object
 *       example:
 *         email: encoded email from forgot password
 *         entityType: employee  
 *         currentPassword: currentpassword
 *         newPassword: newpassword
 *         confirmPassword: confirmpassword
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     employeeChangePasswordResponse:
 *       type: object
 *       properties:
 *         respCode:
 *           type: integer
 *           example: 200
 *           description: HTTP status code
 *         respMessage:
 *           type: string
 *           example: "Password changed successfully."
 *           description: Message confirming password reset initiation
 */


/**@swagger apis */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Employee
 *     description: Employee login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/employeeLoginInput'
 *     responses:
 *       201:
 *         description: Employee login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/employeeloginResponse'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Employee
 *     description: Employee logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/employeeLoginInput'
 *     responses:
 *       200:
 *         description: Employee logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/employeeLogoutResponse'
 */

/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     tags:
 *       - Employee
 *     description: Initiate password reset for a user
 *     parameters:
 *       - in: query
 *         name: email
 *         description: Email address of the user requesting password reset
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/employeeForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/employeeForgotPasswordResponse'
 */

/**
 * @swagger
 * /api/auth/changeRecoverPassword:
 *   post:
 *     tags:
 *       - Employee
 *     description: Employee change recover password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/employeeCreateChangeRecoveryPasswordInput'
 *     responses:
 *       201:
 *         description: Employee logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/employeeChangeRecoveryPasswordResponse'
 */


/**
 * @swagger
 * /api/auth/changePassword:
 *   post:
 *     tags:
 *       - Employee
 *     description: Employee change recover password
 *     parameters:
 *       - in: query
 *         name: _id
 *         description: logined employee id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: adminReset
 *         description: Indicates if the password reset is initiated by an admin
 *         required: true
 *         schema:
 *           type: boolean

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/employeeCreateChangePasswordInput'
 *     responses:
 *       201:
 *         description: Employee logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/employeeChangePasswordResponse'
 */