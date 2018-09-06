const React = require('react');
const ReactDOMServer = require('react-dom/server');
const List = require('./List.jsx');
const Detail = require('./Detail.jsx');
const NotFound = require('./NotFound.jsx');

class HTML extends React.Component {
  render() {
    var data = this.props;
    var component = {};
    var initScript = '';
    switch (data.component) {
      case "List":
        component = <List {...data} />;
        break;
      case "Detail":
        initScript = 'main(' + JSON.stringify( { comments: ( typeof data.data.comments === "undefined" )? [] : data.data.comments, component: data.component, id: data.id, session: data.data.session } ).replace(/script/g, 'scr"+"ipt') + ',"comment-form")';
        component = <Detail {...data} />;
        break;
      default:
        component = <NotFound />;
    }

    const contentHtml = ReactDOMServer.renderToString(component);
    
    return (
      <html lang="ru">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="style.css" />
          <script src="https://www.google.com/recaptcha/api.js" async defer />
        </head>
        <body>
          <div id="content" dangerouslySetInnerHTML={{__html: contentHtml}} />

          <script src="/main.js" />
          <script dangerouslySetInnerHTML={{__html: initScript }} />
        </body>
      </html>
    );
  }
}

/*HelloMessage.propTypes = {
  div: PropTypes.string,
};*/

module.exports = HTML;