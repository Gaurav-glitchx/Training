require('dotenv').config();

const Hapi = require('@hapi/hapi');
const config = require('./config');
const JwtService = require('./services/jwt.service');

// Models
const AuthModel = require('./models/auth.model');
const UserModel = require('./models/user.model');
const RevokedTokenModel = require('./models/revokedToken.model');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const init = async () => {
  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    routes: {
      cors: config.cors
    }
  });

  try {
    // 1. Register PostgreSQL plugin with proper configuration
    await server.register({
      plugin: require('hapi-postgres-connection'),
      options: {
        connectionString: process.env.DATABASE_URL,
        native: true
      }
    });

    // Verify the client is attached
    if (!server.pg || !server.pg.client) {
      throw new Error('PostgreSQL client not initialized');
    }

    // 2. Test database connection
    try {
      await server.pg.client.query('SELECT 1');
      console.log('✅ Database connection established');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      throw dbError;
    }

    // 3. Register JWT plugin
    await server.register(require('hapi-auth-jwt2'));

    // 4. Initialize models
    const models = {
      Auth: new AuthModel(server.pg),
      User: new UserModel(server.pg),
      RevokedToken: new RevokedTokenModel(server.pg)
    };

    // 5. Make models available in requests
    server.decorate('request', 'models', models);

    // 6. Setup JWT strategy
    server.auth.strategy('jwt', 'jwt', JwtService.getJwtStrategy());
    server.auth.default('jwt');

    // 7. Register routes
    authRoutes(server, models);
    userRoutes(server, models);

    // 8. Start server
    await server.start();
    console.log(`🚀 Server running at ${server.info.uri}`);

  } catch (err) {
    console.error('💥 Server startup failed:', err.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled rejection:', err);
  process.exit(1);
});

init();