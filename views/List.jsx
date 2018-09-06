const React = require('react');
const PropTypes = require('prop-types');

class List extends React.Component {
    render() {
        return (
          <div className="container">List{JSON.stringify(this.props)}</div>
        );
    }
}

module.exports = List;