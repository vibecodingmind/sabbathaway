import fs from 'fs';
import path from 'path';
import multer from 'multer';
import type { Request } from 'express';

const uploadsRoot = path.resolve(process.cwd(), 'uploads', 'verifications');

fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (req, file, cb) => {
    const userId = (req as any).user?.userId || 'anon';
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${userId}-${Date.now()}-${safe}`);
  },
});

export const verificationUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF or image documents are allowed'));
  },
});

export function publicUploadPath(filename: string): string {
  return `/uploads/verifications/${filename}`;
}

export function uploadsAbsoluteDir(): string {
  return path.resolve(process.cwd(), 'uploads');
}

export type MulterRequest = Request & {
  file?: Express.Multer.File;
};
