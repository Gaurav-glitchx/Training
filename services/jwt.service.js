const Jwt = require('@hapi/jwt');
const config = require('../config');

class JwtService {
  static generateToken(payload) {
    return Jwt.token.generate(
      payload,
      {
        key: config.jwt.secret,
        algorithm: 'HS256',
        ttlSec: 3600 // 1 hour expiration
      }
    );
  }

  static getJwtStrategy() {
    return {
      key: config.jwt.secret,
      validate: async (decoded, request) => {
        const revokedTokenModel = new request.models.RevokedToken(request.pg);
        const authModel = new request.models.Auth(request.pg);
        
        // Check if token is revoked
        const isRevoked = await revokedTokenModel.isRevoked(
          request.headers.authorization?.replace('Bearer ', '')
        );
        
        if (isRevoked) {
          return { isValid: false };
        }
        
        // Check if user still exists
        const user = await authModel.getUserProfile(decoded.id);
        
        if (!user) {
          return { isValid: false };
        }
        
        return {
          isValid: true,
          credentials: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          }
        };
      },
      verifyOptions: {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }
    };
  }
}

module.exports = JwtService;