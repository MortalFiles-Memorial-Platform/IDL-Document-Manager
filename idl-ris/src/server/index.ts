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

app.use(cors({ origin: true, credentials: true }));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../../public')));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : 'unknown' });
});

async function start() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');
  } catch (error) {
    console.warn('⚠ Database connection failed (may be initializing):', error instanceof Error ? error.message : error);
  }

  app.listen(PORT, () => {
    console.log(`✓ IDL-RIS backend listening at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
