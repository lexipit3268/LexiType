import { Router } from 'express';
import { DeckController, DeckSchema } from './index.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerApiDoc } from '../../utils/swagger.utils.js';
import { config } from '../../config/index.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

registerApiDoc('get', `${config.api.prefix}/decks`, 'Lấy danh sách bộ từ', 'Decks');
registerApiDoc('post', `${config.api.prefix}/decks`, 'Tạo bộ từ mới', 'Decks', DeckSchema);
registerApiDoc('get', `${config.api.prefix}/decks/{id}`, 'Lấy chi tiết bằng ID', 'Decks');
registerApiDoc('patch', `${config.api.prefix}/decks/{id}`, 'Cập nhật', 'Decks', DeckSchema);
registerApiDoc('delete', `${config.api.prefix}/decks/{id}`, 'Xóa', 'Decks');
registerApiDoc('get', `${config.api.prefix}/decks/view/{slug}`, 'Lấy chi tiết bằng slug', 'Decks');

router
  .route('/')
  .get(DeckController.getDecks)
  .post(validate(DeckSchema), DeckController.createDeck);

router
  .route('/:id')
  .get(DeckController.getDeck)
  .patch(DeckController.updateDeck)
  .delete(DeckController.deleteDeck);

router.route('/view/:slug').get(DeckController.getDeckBySlug);

export default router;
