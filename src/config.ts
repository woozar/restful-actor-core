export const ServerConfig = {
  httpPort: process.env.HTTP_PORT ?? 80,
  debug: true // !!(process.env.DEBUG ?? false),
};
