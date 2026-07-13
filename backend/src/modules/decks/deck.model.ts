import mongoose, { Schema, Document } from 'mongoose';

export interface IDeck extends Document {
  deckID: string;
  title: string;
  description: string;
  slug: string;
  isPublic: boolean;
}

const DeckSchema = new Schema(
  {
    deckID: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export default mongoose.model<IDeck>('Deck', DeckSchema);
