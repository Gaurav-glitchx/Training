const JwtService = require('../services/jwt.service');

class AuthController {
  constructor(models) {
    this.models = models;
  }

  async register(request, h) {
    const { username, password, email, role } = request.payload;
    
    try {
      // Check if user exists
      const existingUser = await this.models.Auth.findByUsername(username) || 
                         await this.models.Auth.findByEmail(email);
      
      if (existingUser) {
        return h.response({ 
          error: 'Username or email already exists' 
        }).code(400);
      }
      
      // Create user
      const user = await this.models.Auth.createUser({ 
        username, password, email, role 
      });
      
      return h.response({ 
        status: 'Success', 
        user 
      }).code(201);
    } catch (err) {
      console.error(err);
      return h.response({ 
        error: 'Error creating user' 
      }).code(500);
    }
  }

  async login(request, h) {
    const { username, password } = request.payload;
    
    try {
      // Find user
      const user = await this.models.Auth.findByUsername(username);
      
      if (!user) {
        return h.response({ 
          error: 'Invalid username or password' 
        }).code(401);
      }
      
      // Verify password
      const isValid = await this.models.Auth.comparePassword(password, user.password);
      
      if (!isValid) {
        return h.response({ 
          error: 'Invalid username or password' 
        }).code(401);
      }
      
      // Generate JWT token
      const token = JwtService.generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      return h.response({ 
        status: 'Success', 
        token 
      });
    } catch (err) {
      console.error(err);
      return h.response({ 
        error: 'Error during login' 
      }).code(500);
    }
  }

  async refresh(request, h) {
    const { id, username, role } = request.auth.credentials;
    
    // Generate new token
    const newToken = JwtService.generateToken({ id, username, role });
    
    return h.response({ 
      status: 'Success', 
      token: newToken 
    });
  }

  async logout(request, h) {
    const token = request.headers.authorization.replace('Bearer ', '');
    
    try {
      // Add token to revocation list
      await this.models.RevokedToken.revoke(token);
      
      return h.response({ status: 'Success' });
    } catch (err) {
      console.error(err);
      return h.response({ error: 'Logout failed' }).code(500);
    }
  }

  async getProfile(request, h) {
    const { id } = request.auth.credentials;
    
    try {
      const user = await this.models.Auth.getUserProfile(id);
      
      if (!user) {
        return h.response({ 
          error: 'User not found' 
        }).code(404);
      }
      
      return h.response(user);
    } catch (err) {
      console.error(err);
      return h.response({ 
        error: 'Error fetching user profile' 
      }).code(500);
    }
  }
}

module.exports = AuthController;