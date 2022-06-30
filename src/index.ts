import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { context } from './context';

import { schema } from './schema';
const PORT = process.env.PORT || 4000
export const app = new ApolloServer({
  schema,
  context,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})



