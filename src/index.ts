import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { closePool } from './db.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async () => ({}),
});

console.log(`🚀 GraphQL Server ready at ${url}`);
console.log(`📖 Apollo Studio Explorer: ${url}`);
console.log(`🌐 CORS enabled for: ${corsOrigin}`);

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down server...');
  await server.stop();
  await closePool();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
