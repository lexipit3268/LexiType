import Deck, { IDeck } from './deck.model.js';

export const getDeckById = async (deckID: string) => {
  return await Deck.findOne({ deckID });
};

export const getAllPublicDecks = async () => {
  return await Deck.find({ isPublic: true }).sort({ createdAt: -1 });
};

export const create = async (deckData: Partial<IDeck>) => {
  const newDeck = new Deck(deckData);
  return await newDeck.save();
};

export const updateOne = async (deckID: string, updateData: Partial<IDeck>) => {
  return await Deck.findOneAndUpdate({ deckID }, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteOne = async (deckID: string) => {
  return await Deck.findOneAndDelete({ deckID });
};
