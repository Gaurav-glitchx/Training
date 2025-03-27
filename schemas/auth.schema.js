const Joi = require('@hapi/joi');

module.exports = {
  authSchema: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(4).required()
  }),
  registerSchema: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('user', 'admin').default('user')
  })
};