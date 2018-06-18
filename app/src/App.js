import React, { Component } from "react";
import { graphql, QueryRenderer } from "react-relay";
import logo from "./logo.svg";
import "./App.css";
import environment from "./Environment";

class App extends Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query AppBooksQuery {
            searchBooks(filter: "t", first: 10) {
              edges {
                node {
                  title
                  author
                }
              }
            }
          }
        `}
        render={({ error, props }) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }

          const { edges } = props.searchBooks;

          return (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Welcome to React</h1>
              </header>
              <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
              </p>
              <ol>
                {edges.map(({ node: { author, title } }, index) => (
                  <li key={`${title}-${index}`}>
                    <p>Book: {title}</p>
                    <p>Author: {author}</p>
                    <hr/>
                  </li>
                ))}
              </ol>
            </div>
          );
        }}
      />
    );
  }
}

export default App;

// export default createFragmentContainer(
//   App,
//   graphql`
//     # As a convention, we name the fragment as '<ComponentFileName>_<propName>'
//     fragment App_books on Query {
//       searchBooks(filter: "t", first: 10) {
//         edges {
//           node {
//             title
//             author
//           }
//         }
//       }
//     }
//   `
// );
