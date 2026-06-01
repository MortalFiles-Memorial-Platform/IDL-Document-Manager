import { Router } from 'express';
import { Buffer } from 'buffer';
import { uploadBufferToS3 } from '../utils/s3';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();
router.use(authenticateToken);

router.post('/signature', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT'), async (req, res) => {
  const { fileName, contentType, base64Data } = req.body;
  if (!fileName || !contentType || !base64Data) {
    return res.status(400).json({ message: 'fileName, contentType and base64Data are required.' });
  }
  const buffer = Buffer.from(base64Data, 'base64');
  const key = `signatures/${Date.now()}-${fileName}`;
  const url = await uploadBufferToS3(buffer, key, contentType);
  res.json({ url });
});

export default router;
