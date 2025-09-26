import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },
    content: {
      type: String,
      required: true,
      maxLength: 5000
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#C1D8F7'
    }
  },
  {
    timestamps: true,
    collection: "notes",
  }
);

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

export default Note;