import mongoose from "mongoose";

const SourceArticleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    titleNumber: { type: Number, required: true },
    titleName: { type: String, required: true },
    chapterNumber: { type: Number, required: true },
    chapterName: { type: String, required: true },
    articleNumber: { type: Number, required: true },
    text: { type: String, required: true },
    excerpt: { type: String, required: true }
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    sourceArticles: { type: [SourceArticleSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      default: "Nueva conversación"
    },
    messages: {
      type: [MessageSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", ConversationSchema);
