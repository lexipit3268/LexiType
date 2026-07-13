import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { DeckSchema } from '../modules/decks/deck.schema';

export const registry = new OpenAPIRegistry();

registry.register('Deck', DeckSchema);
