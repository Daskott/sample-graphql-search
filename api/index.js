const express = require("express");
const graphqlHTTP = require("express-graphql");
const bodyParser = require("body-parser");
const { makeExecutableSchema } = require("graphql-tools");
const cors = require("cors");
const app = express();

// Some fake data
const books = [
  {
    id: 1010,
    title: "Harry Potter and the Sorcerer's stone",
    author: "J.K. Rowling"
  },
  {
    id: 1020,
    title: "Jurassic Park",
    author: "Michael Crichton"
  },
  {
    id: 1322,
    title: "Born a crime",
    author: "Trevor Noah"
  },
  {
    id: 1355,
    title: "The everything store",
    author: "Jeff Bezos"
  },
  {
    id: 1356,
    title: "The Batman",
    author: "Alfred Butler"
  }
].sort((a, b) => {
  if (a.author.toLocaleLowerCase() < b.author.toLowerCase()) {
    return -1;
  }
  if (a.author.toLocaleLowerCase() > b.author.toLowerCase()) {
    return 1;
  }
  return 0;
});

// The GraphQL schema in string form
const typeDefs = `
    type Query { 
        books: [Book!]!, book(id: ID!): Book,
        searchBooks(filter: String, first: Int, after: Int): BookConnection
    }
    
    type Book { id: ID!, title: String, author: String }
    
    type BookEdge {
        cursor: String!
        node: Book
    }

    type BookConnection {
        edges: [BookEdge!]!
    }
`;

// The resolvers
const resolvers = {
  Query: {
    books: () => books,
    book: (root, { id }) => books.find(({ id: currId }) => currId == id),
    searchBooks: (root, { filter, first, after }) => {
      /**
       * first: How many records to get
       * after: The cursor, which could be an offset or id based pagination
       * In this case, cursor => is an offset based pagination => using index,
       * Where row number could be the offset
       *
       * Or you could use Id???
       */

      /*
        {
            hero {
                name
                friends(first:2) {
                    totalCount
                    edges {
                        node {
                            name
                        }
                        cursor
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
            }
        }
        */

      const filterParam = filter.toLowerCase();
      const startIndex = after ? parseInt(after, 10) : 0;
      let endIndex = books.length;

      if (first && after) {
        endIndex = parseInt(after, 10) + parseInt(first, 10);
      } else if (first) {
        endIndex = parseInt(first, 10);
      }

      const paginatedBookEdges = books
        .map((item, index) => ({ cursor: index + 1, node: item }))
        .slice(startIndex, endIndex);

      const filteredBookEdges = paginatedBookEdges.filter(
        ({ node: { title, author } }) => {
          return (
            title.toLowerCase().includes(filterParam) ||
            author.toLowerCase().includes(filterParam)
          );
        }
      );

      return {
        edges: filteredBookEdges
      };
    }
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const CORS_OPTION = {
  origin: function(origin, callback) {
    console.log({ origin });
    callback(null, true);
  }
};

app.use(cors(CORS_OPTION));

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

// Start the server
app.listen(4000, () => {
  console.log("Go to http://localhost:4000/graphql to run queries!");
});
