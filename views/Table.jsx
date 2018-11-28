import React from "react";
import ReactTable from "react-table";
const SubDetail = require('./SubDetail.jsx');
import matchSorter from 'match-sorter'

class Table extends React.Component {
    constructor(props) {
      super(props);
      this.state = props;
    }
    /*componentDidMount() {
      this.setState({rowsCount: 20});
      console.log('loaded');
    }*/
    render() {
      const { data } = this.state;
      const listIndustries = [['I_RETAIL','Розничная торговля'],['I_BUSINESS_TO_BUSINESS','Для бизнеса'],['I_CONSUMER_PACKAGED_GOODS','Потребительские товары'],['I_EDUCATION','Образование'],['I_FINANCE','Финансы'],['I_MEDIA_AND_ENTERTAINMENT','Медиа и развлечения'],['I_AUTOMOTIVE','Автомобильные'],['I_HEALTHCARE','Здоровье и уход'],['I_TRAVEL','Путешествия'],['I_TECHNOLOGY','Технологии']].map( (el,index)=><option key={index} value={el[0]}>{el[1]}</option> );
      const listServices = [ ['S_ADVERTISING_ON_GOOGLE','Реклама в Google'],['S_AN_ONLINE_MARKETING_PLAN','Онлайн маркетинговый план'],['S_AN_ENHANCED_WEBSITE','Оптимизация вебсайта'],['S_ADVANCED_ADWORDS_SUPPORT','Помощь в продвижении Adwords'],['S_MOBILE_WEBSITE_SERVICES','Услуги для мобильных вебсайтов'] ].map( (el,index)=><option key={index} value={el[0]}>{el[1]}</option> );
      return (
          <ReactTable
            data={data}
            filterable
            columns={[
              {
                Header: "",
                columns: [
                  {
                    Header: "Позиция",
                    accessor: "num",
                    Cell: props => <span className='table-number'>{props.value}</span>,
                    maxWidth: 80
                  },
                ]
              },
              {
                Header: "Марка",
                columns: [
                  {
                    Header: "Логотип",
                    accessor: "displayImageUrl",
                    Cell: props => <div className="table-img-wrap"><img src={ (props.value === "undefined"||null)?'/img/alert.png':props.value } className='table-img' /></div>,
                    filterable: false,
                    sortable: false,
                    maxWidth: 80
                  },
                  {
                    Header: "Название",
                    accessor: "displayName",
                    Cell: row => <span className='table-number'>
                      {row.original.displayName}
                      <noscript dangerouslySetInnerHTML={{ __html: "<a href='/"+row.original.id+"/'>&nbsp;&nbsp;Подробно</a>" }} />
                    </span>,
                    filterMethod: (filter, rows) =>
                      matchSorter(rows, filter.value, { keys: ["displayName"] }),
                    filterAll: true
                  },
                  {
                    Header: "Сайт",
                    accessor: "websiteUrl",
                    Cell: props => <a href={props.value} rel="nofollow" target="_blank" className='table-link'>{props.value}</a>,
                    filterMethod: (filter, rows) =>
                      matchSorter(rows, filter.value, { keys: ["websiteUrl"] }),
                    filterAll: true
                  },
                ]
              },
              {
                Header: "Критерии",
                columns: [
                  {
                    Header: "Индустрии",
                    accessor: "industries",
                    Cell: props => <ul> {props.value.map( (el,index) => <li key={index}>{el.slice(2)}</li> )} </ul>,
                    filterMethod: (filter, rows) => {
                      if (filter.value === "") return true;
                      return rows[filter.id].includes(filter.value);
                    },
                    Filter: ({ filter, onChange }) =>
                    <select
                      onChange={event => onChange(event.target.value)}
                      style={{ width: "100%" }}
                      value={filter ? filter.value : ""}
                    >
                      <option value="">Все</option>
                      {listIndustries}
                    </select>
                  },
                  {
                    Header: "Сервисы",
                    accessor: "services",
                    Cell: props => <ul> {props.value.map( (el,index) => <li key={index}>{el.slice(2)}</li> )} </ul>,
                    filterMethod: (filter, rows) => {
                      if (filter.value === "all") return true;
                      return rows[filter.id].includes(filter.value);
                    },
                    Filter: ({ filter, onChange }) =>
                    <select
                      onChange={event => onChange(event.target.value)}
                      style={{ width: "100%" }}
                      value={filter ? filter.value : "all"}
                    >
                      <option value="all">Все</option>
                      {listServices}
                    </select>
                  },
                  {
                    Header: "Минимальный месячный бюджет",
                    accessor: "MonthlyBudget",
                    filterMethod: (filter, rows) => {
                      if ( parseInt(filter.value) <= 1) return true;
                      return ( parseInt(rows[filter.id]) <= parseInt(filter.value) );
                    },
                  },
                ]
              },
            ]}
            defaultPageSize={20}
            className="-striped -highlight"
            SubComponent={row => <SubDetail id={row.original.id} />}
            previousText={'Назад'}
            nextText={'Далее'}
            loadingText={'Загрузка...'}
            noDataText={'Строки не найдены'}
            pageText={'Страница'}
            ofText={'из'}
            rowsText={'строк'}
          />
      );
    }
}

module.exports = Table;