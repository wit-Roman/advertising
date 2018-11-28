const React = require('react');

function DataToList(props) {
    if (props.state == '') return null;
    if (props.state == "load") return <img src="img/wait.svg" />;
    if (props.state == "404") return 'Не найдено';

    var i = 0;
    var createItem = (item) => {
        return (
            <li key={i++}>
                <span className="search-data-name">{item.displayName}</span> 
                <span className="search-data-website"><a target="_blank" rel="nofollow" href={item.websiteUrl}>{item.websiteUrl}</a></span> 
                <span className="search-data-more"><a href={'/'+item.id}>Подробно</a></span>
            </li>
        )
    };
    
    if (props.state == "ready" && props.data.length > 0) {
        return ( <div className="result-field"><ul>{props.data.map(createItem)}</ul></div> );
    } else {
        return null;
    }
}

class SearchForm extends React.Component {
    constructor() {
      super();
      this.state = {};
      this.data = {};
      this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
        this.setState({ 
            state:"",
        });
    }
    handleChange(e) {
        const target = e.target;
        if (target.value != '' && target.value.length > 1 && target.value.length < 16) {
            if ( this.data.hasOwnProperty(target.value) ) {
                //this.state.data = this.state.store[target.value];
                this.setState({
                    data: this.data[target.value]
                });
            } else {
                this.send(target.value);
            }
        } else {
            this.setState({ 
                data:[],
            });
        }
    }
    send(query) {
        this.setState({ 
            state:"load"
        });
        const request = {
            type: "search",
            options: {
                query: query
            }
        }
        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open('post', '/search/', !0);
        xhr.setRequestHeader("X-Requested-With","xmlhttprequest");
        xhr.send( JSON.stringify(request) );
        var _obj = this;
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                _obj.data[query] = this.response.data;
                _obj.setState({
                    state:"ready",
                    data: this.response.data
                });
            } else if (this.status === 404) {
                _obj.data[query] = null;
                _obj.setState({
                    state:"404",
                    data:null
                });
            }
        }
    }
    render() {
      return (
          <form className="form-inline" method="post">
            <input type="search" name="query" placeholder="Поиск" onChange={this.handleChange} className="input-text search-field" />
            <div className="result-field-wrap">
                <DataToList state={ (this.state.hasOwnProperty("state"))?this.state.state:"" } data={(this.state.hasOwnProperty("data"))?this.state.data:[]} />
            </div>
          </form>
      );
    }
}


module.exports = SearchForm;