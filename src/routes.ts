import express, { Request, Response } from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const __dirname = process.cwd();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	standardHeaders: true,
	legacyHeaders: false,
});

router.use(limiter);

router.get('/', (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

router.use((req: Request, res: Response) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

export default router;
