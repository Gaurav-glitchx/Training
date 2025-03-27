module.exports = {
    jwt: {
      secret: process.env.JWT_SECRET || 'Gauravg@1',
      expiration: '1h'
    },
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    },
    cors: {
      origin: ['*'],
      headers: ['Accept', 'Content-Type', 'Authorization'],
      credentials: true
    }
  };