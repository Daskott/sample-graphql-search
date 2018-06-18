import React, { Component, Fragment } from "react";
import { graphql, createRefetchContainer } from "react-relay";

class List extends Component {
  state = {
    searchText: ""
  };

  _refetch = () => {
    const { relay } = this.props;
    const { searchText } = this.state;

    relay.refetch(
      { searchText }, // Our refetchQuery needs to know the `searchText`
      null, // We can use the refetchVariables as renderVariables
      () => {
        console.log("Refetch done");
      },
      { force: true } // Assuming we've configured a network layer cache, we want to ensure we fetch the latest data.
    );
  };

  render() {
    const { searchText } = this.state;
    const { relay, searchData } = this.props;
    const {
      searchBooks: { edges = [] }
    } = searchData;

    if (relay.isLoading) {
      return <p>Loading . . .</p>;
    }

    console.log(this.props);
    return (
      <Fragment>
        <label>
          Search:
          <input
            type="text"
            name="textInput"
            value={searchText}
            onChange={event => {
              this.setState({ searchText: event.target.value });
            }}
          />
          <br />
        </label>
        <button onClick={() => this._refetch()}>Search</button>
        <ol>
          {edges.map(({ node: { author, title } }, index) => (
            <li key={`${title}-${index}`}>
              <p>Book: {title}</p>
              <p>Author: {author}</p>
              <hr />
            </li>
          ))}
        </ol>
      </Fragment>
    );
  }
}

export default createRefetchContainer(
  List,
  graphql`
    # As a convention, we name the fragment as '<ComponentFileName>_<propName>'
    fragment List_searchData on Query {
      searchBooks(filter: $searchText, first: 10) {
        edges {
          node {
            title
            author
          }
        }
      }
    }
  `,
  graphql`
    # Refetch query to be fetched upon calling .
    # Notice that we re-use our fragment and the shape of this query matches our fragment spec.
    query List_RefetchQuery($searchText: String) {
      ...List_searchData
    }
  `
);
