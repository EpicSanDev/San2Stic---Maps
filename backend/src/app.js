const app = require('./server');
const { initDB } = require('./models');

const PORT = process.env.PORT || 4000;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server '${process.env.npm_package_name}' running on port ${PORT}`);
    console.log(`🔒 Security middleware enabled`);
    console.log(`📊 Health check available at /api/health`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
