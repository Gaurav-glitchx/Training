class UsersController {
    constructor(models) {
      this.models = models;
    }
  
    async getAllUsers(request, h) {
      const { page, limit } = request.query;
      
      try {
        const result = await this.models.User.findAll(page, limit);
        
        return h.response({
          data: result.data,
          pagination: {
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            currentPage: page,
            perPage: limit
          }
        });
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    }
  
    async getUserById(request, h) {
      const id = request.params.id;
      const { role, id: userId } = request.auth.credentials;
      
      // Regular users can only view their own profile
      if (role !== 'admin' && id != userId) {
        return h.response({ error: 'Unauthorized' }).code(403);
      }
      
      try {
        const user = await this.models.User.findById(id);
        
        if (!user) {
          return h.response({ error: 'User not found' }).code(404);
        }
        return h.response(user);
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    }
  
    async createUser(request, h) {
      // Only allow admins to create users
      if (request.auth.credentials.role !== 'admin') {
        return h.response({ error: 'Unauthorized' }).code(403);
      }
      
      try {
        const user = await this.models.User.create(request.payload);
        return h.response({ Status: 'Success', user }).code(201);
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Error creating user' }).code(500);
      }
    }
  
    async updateUser(request, h) {
      const id = request.params.id;
      const updates = request.payload;
      const { role, id: userId } = request.auth.credentials;
      
      // Check if user is admin or owns the account
      if (role !== 'admin' && id != userId) {
        return h.response({ error: 'Unauthorized' }).code(403);
      }
      
      // Admins can update any field, regular users can't update certain fields
      if (role !== 'admin') {
        const restrictedFields = ['role', 'is_active'];
        for (const field in updates) {
          if (restrictedFields.includes(field)) {
            return h.response({ 
              error: `You are not authorized to update ${field}` 
            }).code(403);
          }
        }
      }
      
      try {
        const updatedUser = await this.models.User.update(id, updates);
        if (!updatedUser) {
          return h.response({ error: 'User not found' }).code(404);
        }
        return h.response({ status: 'Success', user: updatedUser });
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Error updating user' }).code(500);
      }
    }
  
    async deleteUser(request, h) {
      const id = request.params.id;
      const { role, id: userId } = request.auth.credentials;
      
      // Only allow admins to delete users or users to delete themselves
      if (role !== 'admin' && id != userId) {
        return h.response({ error: 'Unauthorized' }).code(403);
      }
      
      try {
        const deletedUser = await this.models.User.delete(id);
        if (!deletedUser) {
          return h.response({ error: 'User not found' }).code(404);
        }
        return h.response({ status: 'Success', deletedUser });
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Error deleting user' }).code(500);
      }
    }
  
    async getUsersHtml(request, h) {
      try {
        const { rows } = await request.pg.client.query('SELECT first_name FROM users');
        const html = `<ul>${rows.map(user => `<li>${user.first_name}</li>`).join("")}</ul>`;
        return h.response(html).type('text/html');
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    }
  }
  
  module.exports = UsersController;