class UserModel {
    constructor(pg) {
      this.pg = pg;
    }
  
    async findAll(page = 1, limit = 10) {
      const offset = (page - 1) * limit;
      const usersQuery = 'SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2';
      const countQuery = 'SELECT COUNT(*) FROM users';
      
      const users = await this.pg.client.query(usersQuery, [limit, offset]);
      const count = await this.pg.client.query(countQuery);
      
      return {
        data: users.rows,
        total: parseInt(count.rows[0].count, 10)
      };
    }
  
    async findById(id) {
      const { rows } = await this.pg.client.query(
        'SELECT * FROM users WHERE id = $1', 
        [id]
      );
      return rows[0];
    }
  
    async create(user) {
      const columns = Object.keys(user).join(', ');
      const values = Object.values(user);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const { rows } = await this.pg.client.query(
        `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    }
  
    async update(id, updates) {
      const setClause = Object.keys(updates)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(', ');
      
      const values = Object.values(updates);
      values.push(id);
      
      const { rows } = await this.pg.client.query(
        `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return rows[0];
    }
  
    async delete(id) {
      await this.pg.client.query('BEGIN');
      
      await this.pg.client.query(
        'DELETE FROM users_auth WHERE id = $1',
        [id]
      );
      
      const { rows } = await this.pg.client.query(
        'DELETE FROM users WHERE id = $1 RETURNING *', 
        [id]
      );
      
      await this.pg.client.query('COMMIT');
      return rows[0];
    }
  }
  
  module.exports = UserModel;