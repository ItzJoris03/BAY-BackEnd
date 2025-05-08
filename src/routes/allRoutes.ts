import { Router } from "express";
import contentRoutes from './contentRoutes';
import encyclopediaRoutes from './encyclopedia';

const router = Router();

router.use('/content', contentRoutes);
router.use('/encyclopedia', encyclopediaRoutes);

export default router;
