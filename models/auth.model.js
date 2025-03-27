const bcrypt = require('bcrypt');

class AuthModel {
  constructor(pg) {
    this.pg = pg;
  }

  async findByUsername(username) {
    const { rows } = await this.pg.client.query(
      'SELECT * FROM users_auth WHERE username = $1',
      [username]
    );
    return rows[0];
  }

  async findByEmail(email) {
    const { rows } = await this.pg.client.query(
      'SELECT * FROM users_auth WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  async createUser({ username, password, email, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await this.pg.client.query(
      'INSERT INTO users_auth (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, hashedPassword, email, role]
    );
    return rows[0];
  }

  async getUserProfile(id) {
    const { rows } = await this.pg.client.query(
      'SELECT id, username, email, role, created_at FROM users_auth WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = AuthModel;