const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(cors());

// --- SWAGGER CONFIGURATION ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'User Service API',
    version: '1.0.0',
    description: 'API for managing users in the Carbon Footprint App'
  },
  paths: {
    '/users': {
      post: {
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string', example: 'U101' },
                  name: { type: 'string', example: 'Alice Sharma' },
                  region: { type: 'string', example: 'IN-WEST' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'User created successfully' } }
      }
    },
    '/users/{userId}': {
      get: {
        summary: 'Get a user by ID',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User found' }, '404': { description: 'User not found' } }
      }
    }
  }
};

// Serve Swagger UI at the /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ User Service connected to MongoDB (userdb)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  region: { type: String, default: 'IN-WEST' }
});
const User = mongoose.model('User', userSchema);

// Endpoints
app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
  console.log(`📄 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
