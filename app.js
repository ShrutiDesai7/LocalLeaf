const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const orderRoutes = require('./routes/orderRoutes');
const plantRoutes = require('./routes/plantRoutes');
const authRoutes = require('./routes/authRoutes');
const nurseryRoutes = require('./routes/nurseryRoutes');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.json({
    appName: 'Orders API',
    message: 'Node.js + Express + MySQL backend',
    version: '1.0.0'
  });
});

app.use('/orders', orderRoutes);
app.use('/plants', plantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nursery', nurseryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err?.name === 'MulterError') {
    return res.status(400).json({
      message: 'Upload error',
      error: err.message,
      field: err.field
    });
  }

  if (typeof err?.message === 'string' && err.message.includes('Unexpected field')) {
    return res.status(400).json({
      message: 'Upload error',
      error: err.message
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
