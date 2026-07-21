import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as deckService from './deck.service.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { ApiError } from '../../core/ApiError.js';

export const getDecks = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;

  const decks = await deckService.getDecks(ownerId);

  res.status(StatusCodes.OK).json({
    success: true,
    data: decks,
  });
});

export const createDeck = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const deckData = { ...req.body, ownerId };
  const newDeck = await deckService.create(deckData);
  res.status(StatusCodes.CREATED).json({
    success: true,
    data: newDeck,
  });
});

export const getDeck = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const deck = await deckService.getDeckById(String(id), ownerId);

  if (!deck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng này!');
  }

  res.status(StatusCodes.OK).json({ success: true, data: deck });
});

export const getDeckBySlug = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { slug } = req.params;
  const deck = await deckService.getDeckBySlug(String(slug), ownerId);

  if (!deck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng này!');
  }

  res.status(StatusCodes.OK).json({ success: true, data: deck });
});

export const updateDeck = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const updateData = req.body;

  const updatedDeck = await deckService.updateOne(String(id), updateData, ownerId);

  if (!updatedDeck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng để cập nhật!');
  }

  res.status(StatusCodes.OK).json({ success: true, data: updatedDeck });
});

export const deleteDeck = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;

  const { id } = req.params;
  const deletedDeck = await deckService.deleteOne(String(id), ownerId);

  if (!deletedDeck) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ từ vựng để xóa!');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Đã xóa bộ từ vựng thành công!',
  });
});
