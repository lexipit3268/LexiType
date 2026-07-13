import { Router } from 'express';
import DeckRoutes from '../modules/decks/deck.routes';
const router = Router();

router.use('/decks', DeckRoutes);

export default router;
