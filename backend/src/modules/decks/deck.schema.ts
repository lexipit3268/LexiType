import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const DeckSchema = z.object({
  deckID: z.string().openapi({ description: 'Mã định danh duy nhất' }),
  title: z.string().openapi({ description: 'Tiêu đề bộ từ' }),
  description: z.string().openapi({ description: 'Mô tả bộ từ' }),
  slug: z.string().openapi({ description: 'URL slug' }),
  isPublic: z.boolean().default(true).openapi({ description: 'Công khai hay không' }),
});

export type DeckInput = z.infer<typeof DeckSchema>;
