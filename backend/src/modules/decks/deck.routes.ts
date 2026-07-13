import { Router } from 'express';
import { DeckController, DeckSchema } from './index.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerApiDoc } from '../../utils/swagger.utils.js';

const router = Router();

// đăng ký Swagger cho tài liệu
registerApiDoc('get', '/api/decks', 'Lấy danh sách bộ từ', 'Decks');
registerApiDoc('post', '/api/decks', 'Tạo bộ từ mới', 'Decks', DeckSchema);
registerApiDoc('get', '/api/decks/{deckID}', 'Lấy chi tiết', 'Decks');
registerApiDoc('patch', '/api/decks/{deckID}', 'Cập nhật', 'Decks');
registerApiDoc('delete', '/api/decks/{deckID}', 'Xóa', 'Decks');

router
  .route('/')
  .get(DeckController.getDecks)
  .post(validate(DeckSchema), DeckController.createDeck);

router
  .route('/:deckID')
  .get(DeckController.getDeck)
  .patch(DeckController.updateDeck)
  .delete(DeckController.deleteDeck);

export default router;
