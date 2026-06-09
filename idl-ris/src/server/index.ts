import express, { json, urlencoded } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import inventoryRoutes from './routes/inventory';
import documentRoutes from './routes/documents';
import loanRoutes from './routes/loans';
import reportRoutes from './routes/reports';
import auditRoutes from './routes/audit';
import uploadRoutes from './routes/uploads';
import prisma from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

console.log('Server configuration:');
console.log(`- PORT: ${PORT}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('');

app.use(cors({ origin: true, credentials: true }));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Serve built client files
app.use(express.static(path.join(__dirname, '../../dist')));

// Health check endpoint
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/uploads', uploadRoutes);

// SPA fallback: serve index.html for all non-API routes
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'unknown' });
});

async function start() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Database connected');
  } catch (error) {
    console.error('✗ Database connection failed:', error instanceof Error ? error.message : error);
    console.log('⚠ Starting server without database (will fail on first request)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ IDL-RIS backend listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('✗ Failed to start server:', error);
  process.exit(1);
});
