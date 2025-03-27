class RevokedTokenModel {
    constructor(pg) {
      this.pg = pg;
    }
  
    async revoke(token) {
      await this.pg.client.query(
        'INSERT INTO revoked_tokens (token) VALUES ($1)',
        [token]
      );
    }
  
    async isRevoked(token) {
      const { rows } = await this.pg.client.query(
        'SELECT * FROM revoked_tokens WHERE token = $1',
        [token]
      );
      return rows.length > 0;
    }
  }
  
  module.exports = RevokedTokenModel;