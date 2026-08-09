export type Article = {
  id: string;
  titleNumber: number;
  titleName: string;
  chapterNumber: number;
  chapterName: string;
  articleNumber: number;
  text: string;
};

export type TitleNavigation = {
  number: number;
  name: string;
  chapters: { number: number; name: string; articleCount: number }[];
  articleCount: number;
};

export type UserSettings = {
  theme: "light" | "dark";
  fontSize: "sm" | "md" | "lg";
  highContrast: boolean;
  language: "es" | "en";
};

export type User = {
  id: string;
  name: string;
  email: string;
  settings: UserSettings;
};

export type ConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  sourceArticles?: Article[];
};

export type ConversationDto = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
};

export type ChatConfig = {
  providerAvailable: boolean;
  provider: string;
  model: string;
  locale: "es" | "en";
  fallbackNotice: string;
};

export type ChatResponse = {
  provider: ChatConfig;
  providerState: "provider" | "fallback" | "local";
  conversation: ConversationDto;
  assistantMessage: { role: "assistant"; content: string; sourceArticles?: Article[] };
  contextArticles: Article[];
};
