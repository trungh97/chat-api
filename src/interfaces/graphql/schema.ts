export const typeDefs = `#graphql
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    findPostById(id: ID!): Post
  }
`;
