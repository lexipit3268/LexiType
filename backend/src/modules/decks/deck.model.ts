import mongoose, { Schema, Document } from 'mongoose';

export interface IDeck extends Document {
  title: string;
  description: string;
  slug: string;
  isPublic: boolean;
}

const DeckSchema = new Schema(
  {
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

DeckSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret: Record<string, any>) => {
    delete ret._id;
    return ret;
  },
});
export default mongoose.model<IDeck>('Deck', DeckSchema, 'Decks');
