import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { context } from './context';

import { schema } from './schema';
const PORT = process.env.PORT || 4000
export const app = new ApolloServer({
  schema,
  context,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
})



