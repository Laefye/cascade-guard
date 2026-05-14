import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  guildId: process.env.DISCORD_GUILD_ID || '',
  roleId: process.env.DISCORD_ROLE_ID || '',
  channelId: process.env.DISCORD_CHANNEL_ID || '',
  keypairDir: process.env.KEYPAIR_DIR || '.',
  webEndpoint: process.env.WEB_ENDPOINT || '',
  webPublicKey: process.env.WEB_PUBLIC_KEY || '',
  adminUserId: process.env.ADMIN_USER_ID || '',
  port: parseInt(process.env.PORT || '3001', 10),
};
