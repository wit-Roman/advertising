const React = require('react');
const ReactDOM = require('react-dom');
const Detail = require('./CommentForm.jsx');

module.exports = function(data, containerId) {
    console.log('mainjs:'+data.component );
    switch ( data.component ) {
      case "List":
        break;
      case "Detail":
        ReactDOM.hydrate(<Detail {...data} />, document.getElementById(containerId));
        break;
    }
};
