import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as deckService from './deck.service.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { ApiError } from '../../core/ApiError.js';

export const getDecks = asyncHandler(async (req: Request, res: Response) => {
  const decks = await deckService.getAllPublicDecks();

  res.status(StatusCodes.OK).json({
    success: true,
    data: decks,
  });
});

export const createDeck = asyncHandler(async (req: Request, res: Response) => {
  const deckData = req.body;
  const newDeck = await deckService.create(deckData);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: newDeck,
  });
});

export const getDeck = asyncHandler(async (req: Request, res: Response) => {
  const { deckID } = req.params;
  const deck = await deckService.getDeckById(String(deckID));

  if (!deck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng này!');
  }

  res.status(StatusCodes.OK).json({ success: true, data: deck });
});

export const updateDeck = asyncHandler(async (req: Request, res: Response) => {
  const { deckID } = req.params;
  const updateData = req.body;

  const updatedDeck = await deckService.updateOne(String(deckID), updateData);

  if (!updatedDeck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng để cập nhật!');
  }

  res.status(StatusCodes.OK).json({ success: true, data: updatedDeck });
});

export const deleteDeck = asyncHandler(async (req: Request, res: Response) => {
  const { deckID } = req.params;
  const deletedDeck = await deckService.deleteOne(String(deckID));

  if (!deletedDeck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng để xóa!');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa bộ từ vựng thành công!',
  });
});
