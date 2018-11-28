const React = require('react');
const ReactDOM = require('react-dom');
const CommentForm = require('./CommentForm.jsx');
const SearchForm = require('./SearchForm.jsx');
const Table = require('./Table.jsx');

module.exports = function(data, containerId) {
  switch ( data.component ) {
    case "List":
      ReactDOM.hydrate(<SearchForm />, document.getElementById("search-form"));
      ReactDOM.hydrate(<Table {...data} />, document.getElementById("main-table"));
      break;
    case "Detail":
      ReactDOM.hydrate(<CommentForm {...data} />, document.getElementById("comment-form"));
      break;
  }
};
