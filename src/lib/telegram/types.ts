export interface SerializedChannel {
  id: string;
  title: string;
  username: string | null;
  photo: string | null;
  participantsCount: number;
  about: string;
  isChannel: boolean;
  isGroup: boolean;
}

export interface SerializedMessage {
  id: number;
  channelId: string;
  channelTitle: string;
  channelUsername: string | null;
  channelPhoto: string | null;
  text: string;
  date: number;
  views: number | null;
  forwards: number | null;
  replies: number | null;
  hasMedia: boolean;
  mediaType: "photo" | "video" | "document" | "none";
  mediaId: string | null;
  entities: SerializedEntity[];
}

export interface SerializedEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
}
