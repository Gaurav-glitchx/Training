const { 
    userIdSchema, 
    userSchema, 
    userUpdateSchema,
    userQuerySchema
  } = require('../schemas/user.schema');
  const UsersController = require('../controllers/users.controller');
  
  module.exports = (server, models) => {
    const usersController = new UsersController(models);
    
    server.route([
      {
        method: 'GET',
        path: '/users',
        options: {
          auth: false
        },
        handler: usersController.getUsersHtml.bind(usersController)
      },
      {
        method: 'GET',
        path: '/api/users',
        options: {
          auth: 'jwt',
          validate: {
            query: userQuerySchema
          }
        },
        handler: usersController.getAllUsers.bind(usersController)
      },
      {
        method: 'GET',
        path: '/api/users/{id}',
        options: {
          auth: 'jwt',
          validate: {
            params: userIdSchema
          }
        },
        handler: usersController.getUserById.bind(usersController)
      },
      {
        method: 'POST',
        path: '/api/users',
        options: {
          auth: 'jwt',
          validate: {
            payload: userSchema
          }
        },
        handler: usersController.createUser.bind(usersController)
      },
      {
        method: 'PATCH',
        path: '/api/users/{id}',
        options: {
          auth: 'jwt',
          validate: {
            params: userIdSchema,
            payload: userUpdateSchema
          }
        },
        handler: usersController.updateUser.bind(usersController)
      },
      {
        method: 'DELETE',
        path: '/api/users/{id}',
        options: {
          auth: 'jwt',
          validate: {
            params: userIdSchema
          }
        },
        handler: usersController.deleteUser.bind(usersController)
      }
    ]);
  };