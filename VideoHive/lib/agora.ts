// Agora configuration and utilities

export const AGORA_CONFIG = {
  appId: process.env.EXPO_PUBLIC_AGORA_APP_ID || 'your-agora-app-id',
  certificate: process.env.AGORA_APP_CERTIFICATE || 'your-agora-certificate',
};

// Agora token generation (server-side only)
export interface AgoraTokenRequest {
  channelName: string;
  uid: string;
  role: 'host' | 'audience';
}

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: string;
  expireTime: number;
}

// Client-side Agora utilities
export const generateChannelName = (): string => {
  return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateUID = (): number => {
  return Math.floor(Math.random() * 1000000);
};

// Mock Agora token for development
export const getMockAgoraToken = (channelName: string, uid: string): AgoraTokenResponse => {
  return {
    token: `mock_token_${channelName}_${uid}`,
    channelName,
    uid,
    expireTime: Date.now() + 3600000, // 1 hour
  };
};