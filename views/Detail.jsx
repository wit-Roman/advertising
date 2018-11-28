const React = require('react');
const CommentForm = require('./CommentForm.jsx');
import ReactTable from "react-table";

function YanData(props) {
  if(props.YandIsset){
    return (
      <div>
        <ul>
          <li>Клиенты: {props.data.clientsCount}</li>
          <li>Компании: {props.data.companiesCount}</li>
          <li>Показы: {props.data.showsCount}</li>
          <li>Клики: {props.data.clicksCount}</li>
          <li>CTR: {props.data.CTR}</li>
          <li>Ранг: {props.data.rang}</li>
        </ul>
      </div>
    )
  } else {
    return null;
  }
}

class GooData extends React.Component {
  componentDidMount(){
    if(this.props.gooIsset){
      const mapElement = document.getElementById("map_"+this.props.data.id);
      var marks = [];
      this.props.data.locations.forEach(el=>{
        marks.push({
          name:this.props.data.publicProfile.displayName,
          address:el.address,
          latLng:[el.latLng.latitude,el.latLng.longitude],
        });
      });

      ymaps.ready(init);
      function init () {
        var myMap = new ymaps.Map(mapElement, {
          center: marks[0].latLng,
          zoom: 6,
          controls: ['zoomControl']
        });
        marks.forEach(mark=>{
          myMap.geoObjects.add(new ymaps.Placemark(mark.latLng,{
            hintContent: mark.name,
            balloonContent: mark.address
          }));
        });
      }
    }
  }
  render() {
    if(this.props.gooIsset){
      return (
        <div className="google-data-wrap">
          <div className="google-data-logo">
            <img alt="Логотип" src={(this.props.data.publicProfile.displayImageUrl=="undefined"||null)?'/img/alert.png':this.props.data.publicProfile.displayImageUrl} />
          </div>
          <div className="google-data-list">
            <ul>
              <li>Название: {this.props.data.localizedInfos[0].displayName}</li>
              <li>Описание: {this.props.data.localizedInfos[0].overview}</li>
              <li>Коды стран: {(typeof this.props.data.localizedInfos[0].countryCodes === "undefined")?'RU':this.props.data.localizedInfos[0].countryCodes.toString()}</li>
              <li>Адрес: {this.props.data.locations.map(el=>el.address+" ").toString()}</li>
              <li>Минимальный месячный бюджет: {this.props.data.convertedMinMonthlyBudget.units}</li>
              <li>Публичный профиль: {this.props.data.publicProfile.displayName}</li>
              <li>Вебсайт: {this.props.data.websiteUrl}</li>
              <li>Индустрии: {this.props.data.industries.join(', ')}</li>
              <li>Сервисы: {this.props.data.services.join(', ')}</li>
              <li>badgeTier: {this.props.data.badgeTier}</li>
              <li>Ранг: {this.props.data.num}</li>
              <li>Запрошенные специализации: {this.props.data.specializationStatus.map(el=>el.badgeSpecialization+" ").toString()}</li>
            </ul>
          </div>
          <div className="google-data-map">Карта: {this.props.data.locations.length} объектов
            <div className="map-wrap" id={"map_"+this.props.data.id}></div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

function SertificationTable(props) {
  if(props.certificationIsset){
    return(<ReactTable
      data={props.data}
      columns={[
        {
          Header: "Сертификаты",
          columns: [
            {
              Header: "Тип",
              accessor: "type",
            },
            {
              Header: "Количество сертифицированных сотрудников",
              accessor: "userCount",
            },
          ]
        }
      ]}
      defaultPageSize={10}
      className="table-sertifications -highlight"
      previousText={'Назад'}
      nextText={'Далее'}
      loadingText={'Загрузка...'}
      noDataText={'Строки не найдены'}
      pageText={'Страница'}
      ofText={'из'}
      rowsText={'строк'}
    />);
  } else {
    return null;
  }
}

function ClientTable(props) {
  if(props.clientsIsset){
    const clientLength = props.data.length;
    return (
    <ReactTable
        data={props.data}
        columns={[
          {
            Header: "Клиенты "+clientLength,
            columns: [
              {
                Header: "№",
                accessor: "numer",
              },
              {
                Header: "Сайт",
                accessor: "name",
                Cell: props => <a href={'http://'+props.value} rel="nofollow" target="_blank" className='table-link'>{props.value}</a>,
              },
              {
                Header: "Показы",
                accessor: "showsCount",
              },
              {
                Header: "Клики",
                accessor: "clicksCount",
              },
              {
                Header: "CTR",
                accessor: "CTR",
              },
            ]
          }
        ]}
        defaultPageSize={10}
        className="table-clients -highlight"
        previousText={'Назад'}
        nextText={'Далее'}
        loadingText={'Загрузка...'}
        noDataText={'Строки не найдены'}
        pageText={'Страница'}
        ofText={'из'}
        rowsText={'строк'}
      />
    );
  } else {
    return null;
  }
}

class Detail extends React.Component {
  render() {
    const YandIsset = ( this.props.data.hasOwnProperty('advse') )
    const clientsIsset = ( this.props.data.hasOwnProperty('clients') );
    const gooIsset = ( this.props.data.hasOwnProperty('partners') );
    const certificationIsset = (gooIsset && typeof this.props.data.partners.certificationStatuses == "object" && this.props.data.partners.certificationStatuses.length > 0);
    return (
      <div className="container Subdetail-wrap">
        <div>
          <div><GooData data={(gooIsset) ? this.props.data.partners: null} gooIsset={gooIsset} /></div>
          <div><YanData data={(YandIsset) ? this.props.data.advse[0]: null} YandIsset={YandIsset} /></div>
        </div>
        <div>
          <div><ClientTable data={(clientsIsset) ? this.props.data.clients: null} clientsIsset={clientsIsset} /></div>
          <div><SertificationTable data={(certificationIsset)?this.props.data.partners.certificationStatuses: null} certificationIsset={certificationIsset} /></div>
          <div id="comment-form"><CommentForm 
            comments={ ( typeof this.props.data.comments === "undefined" ) ? [] : this.props.data.comments } 
            session={ ( typeof this.props.data.session === "undefined" ) ? {active:0,comCount:0} : this.props.data.session }
            id={ this.props.id }
          /></div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;