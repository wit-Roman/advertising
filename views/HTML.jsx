const React = require('react');
const ReactDOMServer = require('react-dom/server');
const List = require('./List.jsx');
const Detail = require('./Detail.jsx');
const NotFound = require('./NotFound.jsx');

class HTML extends React.Component {
  render() {
    const data = {
      data: this.props.data,
      component: (typeof this.props.component==="string")?this.props.component:"NotFound",
      date: (typeof this.props.date==="string")?this.props.date:"",
      id: (!isNaN(this.props.id))?this.props.id:0,
      param: this.props.param
    };
    var component = {};
    var initScript = '';
    switch (data.component) {
      case "List":
        initScript = 'main(' + JSON.stringify(data).replace(/script/g, 'scr"+"ipt') + ')';
        component = <List {...data} />;
        break;
      case "Detail":
        const dataDetail = {
          comments: ( typeof data.data.comments === "undefined" )? [] : data.data.comments,
          component: data.component,
          id: data.id,
          session: ( typeof data.data.session === "undefined" ) ? {active:0,comCount:0} : data.data.session
        }
        initScript = 'main(' + JSON.stringify(dataDetail).replace(/script/g, 'scr"+"ipt') + ')';
        component = <Detail {...data} />;
        break;
      default:
        component = <NotFound />;
    }

    const contentHtml = ReactDOMServer.renderToString(component);
    
    return (
      <html lang="ru">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <meta name="author" content="@2wit1" />
          <title>Рейтинги web-рекламных агентств</title>
          <meta name="description" content="Автообновляемая рейтинговая система web-рекламных агентств" />
          <meta name="keywords" content="Автообновляемая рейтинговая система web-рекламных агентств" />

          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed" />
          <link rel="stylesheet" href="/main.css" />
          <link rel="stylesheet" href="/r-t.min.css" />
          
          <script src="https://www.google.com/recaptcha/api.js" async defer />
          <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" async defer></script>
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