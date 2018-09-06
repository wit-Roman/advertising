const React = require('react');
const CommentForm = require('./CommentForm.jsx');

class Detail extends React.Component {
    render() {
        return (
          <div className="container">
            <div className="detail-info"> {JSON.stringify(this.props)} </div>
            
            <CommentForm 
              comments={ ( typeof this.props.data.comments === "undefined" ) ? [] : this.props.data.comments } 
              id={this.props.data.id} 
              session={ ( typeof this.props.data.session === "undefined" ) ? null : this.props.data.session }
            />
          </div>
        );
    }
}

module.exports = Detail;