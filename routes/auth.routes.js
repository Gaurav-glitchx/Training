const { registerSchema, authSchema } = require('../schemas/auth.schema');
const AuthController = require('../controllers/auth.controller');
const AuthModel= require('../models/auth.model');
const RevokedTokenModel = require('../models/revokedToken.model');

module.exports = (server, pg) => {
  const models = {
    Auth: new AuthModel(pg),
    RevokedToken: new RevokedTokenModel(pg)
  };
  const authController = new AuthController(models);
  
  server.route([
    {
      method: 'POST',
      path: '/api/auth/register',
      options: {
        auth: false,
        validate: {
          payload: registerSchema
        }
      },
      handler: authController.register.bind(authController)
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      options: {
        auth: false,
        validate: {
          payload: authSchema
        }
      },
      handler: authController.login.bind(authController)
    },
    {
      method: 'POST',
      path: '/api/auth/refresh',
      options: {
        auth: 'jwt'
      },
      handler: authController.refresh.bind(authController)
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      options: {
        auth: 'jwt'
      },
      handler: authController.logout.bind(authController)
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      options: {
        auth: 'jwt'
      },
      handler: authController.getProfile.bind(authController)
    }
  ]);
};