import { Router } from 'express';
import DeckRoutes from '../modules/decks/deck.routes';
import UserRoutes from '../modules/users/user.routes';
const router = Router();

router.use('/decks', DeckRoutes);
router.use('/users', UserRoutes);

export default router;
