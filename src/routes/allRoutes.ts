import { Router } from "express";
import contentRoutes from './contentRoutes';
import encyclopediaRoutes from './encyclopedia';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({ message: "This works!" });
});
router.use('/content', contentRoutes);
router.use('/encyclopedia', encyclopediaRoutes);

export default router;
