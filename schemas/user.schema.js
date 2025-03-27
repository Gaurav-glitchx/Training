const Joi = require('@hapi/joi');

module.exports = {
  userIdSchema: Joi.object({
    id: Joi.number().integer().min(1).required()
  }),
  userSchema: Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    ip_address: Joi.string().required()
  }),
  userUpdateSchema: Joi.object({
    first_name: Joi.string().min(2).max(50),
    last_name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    gender: Joi.string().valid('Male', 'Female', 'Other'),
    ip_address: Joi.string()
  }).min(1),
  userQuerySchema: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};