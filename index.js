var { graphql, buildSchema } = require("graphql");
var express = require("express");
var { createHandler } = require("graphql-http/lib/use/express");

var schema = buildSchema(`
  type Query {
    hello: String
  }`);

var rootValue = {
  hello: () => {
    return "Hello world!";
  },
};

var app = express();

app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue,
    source: "{ hello }",
  })
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
