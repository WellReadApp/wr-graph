import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { ApolloError, ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import jwt from 'jsonwebtoken';
dotenv.config(); // Must be before rest service
import restService from './src/rest/index';
import { Context } from '@src/graph/types/Context';

async function serverFunc() {
  const schema = await buildSchema({
    resolvers: [
      `${__dirname}/src/graph/**/resolver.js`,
      `${__dirname}/src/graph/**/resolvers/*.js`,
    ], // adding all resolvers
  });
  const server = new ApolloServer({
    schema,
    context: async ({ req }): Promise<Context> => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0]) {
        const token = req.headers.authorization.split(' ')[1];
        const publicKEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
        const data:any = jwt.verify(token, publicKEY, {
          algorithms: ['RS256'],
        });
        if (data.user.id) {
          data.user_id = data.user.id;
          data.token = token;
        }
        return data;
      }
    },
    formatError: (err) => {
      console.log('Error', err);
      if (err.extensions.exception.operational || (err.extensions.exception.code && err.extensions.exception.code.includes('GRAPHQL'))) {
        return {
          message: err.message,
        };
      }
      console.log('Server error', err);
      throw new ApolloError('A server error occurred', 'INTERNAL_SERVER_ERROR');
    },
  });
  await server.start();
  server.applyMiddleware({ app: restService, path: '/' });

  const port = process.env.PORT || 4000;
  restService.listen(port, () => {
    console.log(`Server ready at port ${port}`);
  });
}

serverFunc();