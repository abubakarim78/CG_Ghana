import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3100', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  arkesel: {
    apiKey: requireEnv('ARKESEL_API_KEY'),
    senderName: process.env.ARKESEL_SENDER_NAME ?? 'ChildGuard',
    baseUrl: 'https://sms.arkesel.com/api/v2',
    sandbox: process.env.ARKESEL_SANDBOX === 'true',
  },

  // Shared secret for webhook requests from Arkesel
  webhookSecret: requireEnv('WEBHOOK_SECRET'),

  // Internal API key for calls from the mobile backend
  internalApiKey: requireEnv('INTERNAL_API_KEY'),

  // Emergency number for escalation fallback (DOVVSU national line)
  emergencyFallbackPhone: process.env.EMERGENCY_FALLBACK_PHONE ?? '+233302684000',
} as const;
