export interface PrivateMessageDTO {
  to: string;
  content: string;
}

export interface Message {
  from: string;
  content: string;
  timestamp?: string;
}
