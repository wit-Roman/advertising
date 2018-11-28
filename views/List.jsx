const React = require('react');
const SearchForm = require('./SearchForm.jsx');
const Table = require('./Table.jsx');

function SwitchPanel(prop) {
  return (
    <div className="switch-panel">
      <a href={(prop.prop==="yand")?'/':'#'} className={(prop.prop==="yand")?'':'active'}>Google</a>
      <a href={(prop.prop==="yand")?'#':'/?yand'} className={(prop.prop==="yand")?'active':''}>Yandex</a>
    </div>
  );
}

class List extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="menu-line">
          <div className="container" id="search-form">
            <SearchForm />
          </div>
          <div className="menu-line-text-wrap">
            <SwitchPanel prop={this.props.param} />
          </div>
          <div className="menu-line-text-wrap">
            <h1 className="main-title">Автообновляемая рейтинговая система web-рекламных агенств</h1>
          </div>
          <div className="menu-line-text-wrap">
            <span>Дата последнего обновления: </span><span>{this.props.date}</span>
          </div>
          <div className="menu-line-text-wrap description-icon-wrap">
            <a href="#" className="description-icon">
              <img src="/img/question-mark.svg" width="16px" height="16px" />
            </a>
            <div className="result-field">
              <p>
                <span>
                  <ul>
                    <li>Данные берутся из Google Adwords и Yandex Direct API по ключу.</li>
                    <li>Доступно 5 комментариев и 1 оценка в день с 1го браузера.</li>
                    <li>Используются "подписанные куки" - удаление/изменение куки обнуляет количество доступных комментов до следующего дня.</li>
                    <li>Использование другого браузера обнуляет количество доступных комментариев в нем до следующего дня.</li>
                    <li>Для обновления данных мне достаточно отправить POST запрос - новые таблицы подтянуться из API и связи между ними создадуться сами.</li>
                    <li>Зачем???: демо, тренирую js, Express, MySQL и React.</li>
                    <li>Предложения приcылайте на <a rel="nofollow" href="mailto:2witov@gmail.com">2witov@gmail.com</a>. Есть возможность передалать из SSR в SPA и разместить на вашем сайте.</li>
                  </ul>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="container" id="main-table">
          <Table data={this.props.data} />
        </div>
      </div>
    );
  }
}

module.exports = List;