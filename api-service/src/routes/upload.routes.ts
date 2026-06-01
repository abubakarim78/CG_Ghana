import { Router, Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { authenticate } from '../middleware/auth';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';

const router = Router();

router.post(
  '/photo',
  authenticate,
  uploadMiddleware.single('photo'),
  handleUploadError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
      const url = await uploadService.uploadBuffer(req.file.buffer, 'childguard/cases');
      res.json({ url });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
