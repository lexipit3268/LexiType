import Deck, { IDeck } from './deck.model.js';
import { generateSlug } from '../../utils/deck.util.js';
import { ApiError } from '../../core/ApiError.js';
import { StatusCodes } from 'http-status-codes';

export const getDeckById = async (id: string) => {
  return await Deck.findById(id);
};

export const getDeckBySlug = async (slug: string) => {
  return await Deck.findOne({ slug });
};

export const getAllPublicDecks = async () => {
  return await Deck.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const create = async (deckData: any) => {
  const slug = deckData.slug || generateSlug(deckData.title);

  const existingDeck = await Deck.findOne({ slug });

  if (existingDeck) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Tiêu đề bộ từ vựng đã tồn tại, vui lòng chọn tên khác!',
    );
  }

  const newDeck = new Deck({
    ...deckData,
    slug: slug,
  });

  return await newDeck.save();
};

export const updateOne = async (id: string, updateData: Partial<IDeck>) => {
  if (updateData.title || updateData.slug) {
    const newSlug = updateData.slug || generateSlug(updateData.title as string);

    const existingDeck = await Deck.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });

    if (existingDeck) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Tiêu đề bộ từ vựng đã tồn tại, vui lòng chọn tên khác!',
      );
    }

    updateData.slug = newSlug;
  }

  return await Deck.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};
export const deleteOne = async (id: string) => {
  return await Deck.findByIdAndDelete(id);
};
