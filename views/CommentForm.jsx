const React = require('react');
//const PropTypes = require('prop-types');

class FormData extends React.Component {
    render() {
        return (
          <div className="container">{JSON.stringify(this.props)}</div>
        );
    }
}

class CommentList extends React.Component {
    render() {
        var i = 0;
        var createItem = (item) => {
            const star = ( item.star != null || '') ? 'Оценка: '+item.star : '';
            return <li key={i++}>{item.name} : {item.text} {star}</li>;
        };
        return <ul>{this.props.comments.map(createItem)}</ul>;
    }
}

class CommentForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = props;
      this.handleChange = this.handleChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      //this.onStarChange = this.onStarChange.bind(this);
    }
    componentDidMount() {
      console.log('form-load');
      if ( typeof this.state.session === "object" && this.state.session != null ) {
        this.disableStars();
        this.disableCom();
      }
    }
    disableStars(is=false) {
      localStorage.setItem('active',this.state.session.active);
      document.getElementById('comment-star-field').disabled = ( (typeof localStorage === "object" && localStorage.getItem('active') === '0') || is ) ? true : false;
    }
    disableCom(is=false){
      localStorage.setItem('comCount',this.state.session.comCount);    
      document.getElementById('comment-button').disabled = ( (typeof localStorage === "object" && parseInt(localStorage.getItem('comCount')) < 1) || is ) ? true : false;
    }
    handleChange(e) {
      const target = e.target;
      const name = target.name;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({
        [name]: value
      });
    }
    onSubmit(e) {
      e.preventDefault();
      console.dir(this.state);
      const grecaptcha = document.getElementById('g-recaptcha-response').value;
      if ( this.state.text == '' || this.state.name == '' || this.state.id == '' || grecaptcha == '' ) {
        alert( 'Заполните все обязательные поля' );
      } else {
        const options = {
          id: this.state.id,
          star: (typeof this.state.star === "string" && this.state.star !== "" ) ? this.state.star : null,
          name: this.state.name,
          text: this.state.text,
          grecaptcha: grecaptcha,
          type: "comment"
        };
        this.send( options );
      }
    }
    send(options) {
      document.getElementById('comment-button').innerHTML='<img src="img/wait.svg" />';
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.open('post', '/comment/post/', !0);
      xhr.setRequestHeader("X_REQUESTED_WITH","xmlhttprequest");
      xhr.send( JSON.stringify(options) );
      var _obj = this;
      xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          if ( this.response.recaptcha ){
            if (this.response.status === 1) {
              document.getElementById('comment-button').innerHTML='Оценка добавлена';
              _obj.SuccessXHR(options);
            } else if (this.response.status === 2) {
              document.getElementById('comment-button').innerHTML='Комментарий добавлен';
              options.star = null;
              _obj.SuccessXHR(options);
            }
          } else {
            alert('Ошибка рекапчи');
          }
        } 
        else if (this.status === 400) {          
          alert( JSON.stringify(this.response) );
        }
      }
    }
    SuccessXHR(options) {
      delete options.id;
      delete options.grecaptcha;
      delete options.type;
      
      grecaptcha.reset();
      
      let nextcomments = this.state.comments.concat([options]);
      this.setState({
        comments: nextcomments,
        star:'',
        name:'',
        text: '',
        session:{
          active: (this.state.session.active === 1 && options.star != null)? 0: this.state.session.active,
          comCount: (this.state.session.comCount - 1)
        } 
      });
      this.disableStars();
      this.disableCom();
    }
    render() {
      return (
        <div className="container" id="comment-form">
          <FormData data={this.props} />
          <h3>Комментарии</h3>
          <CommentList comments={this.state.comments} />
          <form className="form-inline" id="someForm" method="post" onSubmit={ this.onSubmit }>
            <div className="form-group">
              <fieldset id="comment-star-field">
                <input type="radio" name="star" value="1" checked={this.state.star === "1"} onChange={this.handleChange} className="input-radio comment-star" />
                <input type="radio" name="star" value="2" checked={this.state.star === "2"} onChange={this.handleChange} className="input-radio comment-star" />
                <input type="radio" name="star" value="3" checked={this.state.star === "3"} onChange={this.handleChange} className="input-radio comment-star" />
                <input type="radio" name="star" value="4" checked={this.state.star === "4"} onChange={this.handleChange} className="input-radio comment-star" />
                <input type="radio" name="star" value="5" checked={this.state.star === "5"} onChange={this.handleChange} className="input-radio comment-star" />
              </fieldset>
              <input
                type="text"
                name="name"
                className="input-text comment-name"
                placeholder="Представьтесь"
                value={this.state.name}
                onChange={this.handleChange}
              />
              <textarea
                type="text"
                name="text"
                className="textarea comment-text"
                placeholder="Комментарий"
                value={this.state.text}
                onChange={this.handleChange}
              />
              &nbsp;
            </div>
            <div className="g-recaptcha" data-sitekey="6LfSsm0UAAAAAHkfNuhp6eaVeGFXzL6YRUmHppoR" />
            <button id="comment-button" className="btn button">{'Добавить комментарий / Осталось: ' + this.state.session.comCount}</button>
          </form>
        </div>
      );
    }
  }


module.exports = CommentForm;