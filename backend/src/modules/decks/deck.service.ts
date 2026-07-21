import Deck, { IDeck } from './deck.model.js';
import { generateSlug } from '../../utils/deck.util.js';
import { ApiError } from '../../core/ApiError.js';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export const getDecks = async (ownerId: string) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  return await Deck.find({ ownerId: ownerObjectId }).sort({ createdAt: -1 });
};

export const getDeckById = async (id: string, ownerId: string) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  return await Deck.findOne({ _id: id, ownerId: ownerObjectId });
};

export const getDeckBySlug = async (slug: string, ownerId: string) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  return await Deck.findOne({ slug, ownerId: ownerObjectId });
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

export const updateOne = async (id: string, updateData: Partial<IDeck>, ownerId: string) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

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

  return await Deck.findOneAndUpdate({ _id: id, ownerId: ownerObjectId }, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteOne = async (id: string, ownerId: string) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  return await Deck.findOneAndDelete({ _id: id, ownerId: ownerObjectId });
};
