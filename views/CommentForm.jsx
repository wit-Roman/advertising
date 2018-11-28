const React = require('react');
//const PropTypes = require('prop-types');

function CommentList(props) {
  var i = 0;
  var createItem = (item) => {
    const star = ( item.star != null || '') ? 'Оценка: '+item.star : '';
    return <li key={i++}>{item.name} : {item.text} {star}</li>;
  };
  return <ul>{props.comments.map(createItem)}</ul>;
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
    if ( typeof this.state.session === "object" && this.state.session != null ) {
      this.disableStars();
      this.disableCom();
    }
    grecaptcha.render( "SubDetail_Recaptcha_"+this.state.id, { 'sitekey' : '6LfSsm0UAAAAAHkfNuhp6eaVeGFXzL6YRUmHppoR' } );
  }
  disableStars(is=false) {
    localStorage.setItem('active',this.state.session.active);
    is = ( (typeof localStorage === "object" && localStorage.getItem('active') === '0') || is );
    const elem = document.getElementById("SubDetail_StarField_"+this.props.id);
    elem.disabled = ( is ) ? true : false;
  }
  disableCom(is=false){
    localStorage.setItem('comCount',this.state.session.comCount);
    is = ( (typeof localStorage === "object" && parseInt(localStorage.getItem('comCount')) < 1) || is );
    const elem = document.getElementById("SubDetail_Submit_"+this.props.id);
    elem.disabled = ( is ) ? true : false;
  }
  handleChange(e) {
    const target = e.target;
    if(target.disabled) e.preventDefault();
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [name]: value
    });
  }
  onSubmit(e) {
    e.preventDefault();
    const grecaptcha = e.target.elements["g-recaptcha-response"].value;
    // document.querySelector("#SubDetail_Recaptcha_"+this.state.id+" textarea.g-recaptcha-response").value;
    if ( this.state.text == '' || this.state.name == '' || this.state.id == '' || grecaptcha == '' ) {
      alert( 'Заполните все обязательные поля' );
    } else {
      const options = {
        id: this.state.id,
        star: (typeof this.state.star === "string" && this.state.star !== "" ) ? e.target.elements["star"].value : null,
        name: e.target.elements["name"].value,
        text: e.target.elements["text"].value,
        grecaptcha: grecaptcha,
        type: "comment"
      };
      //console.log(options);
      this.send( options, e.target.elements["submit"] );
    }
  }
  send(options, button) {
    button.innerHTML='<img src="/img/wait.svg" />';
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('post', '/comment/post/', !0);
    xhr.setRequestHeader("X-Requested-With","xmlhttprequest");
    xhr.send( JSON.stringify(options) );
    var _obj = this;
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        if ( this.response.recaptcha ){
          if (this.response.status === 1) {
            button.innerHTML='Оценка добавлена';
            _obj.SuccessXHR(options);
          } else if (this.response.status === 2) {
            button.innerHTML='Комментарий добавлен';
            options.star = null;
            _obj.SuccessXHR(options);
          }
        } else {
          alert('Ошибка рекапчи');
        }
      } 
      else if (this.status === 400) {          
        alert('Ошибка ввода');
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
      <div className="container comment-form-wrap">
        <h3>Комментарии</h3>
        <div><CommentList comments={this.state.comments} /></div>
        <form className="form-inline" method="post" onSubmit={ this.onSubmit } name={"CommentForm_"+this.props.id}> 
          <div className="form-group" >
            <fieldset className="comment-star-field" id={"SubDetail_StarField_"+this.props.id}><div>
              <label className="standart-radio-wrap" htmlFor={this.props.id+"-r1"}>
                <input type="radio" name="star" value="1" checked={this.state.star === "1"} onChange={this.handleChange} className="input-radio comment-star standart-radio" id={this.props.id+"-r1"} />
                <span className="checkmark animated"></span>
              </label>
              <label className="standart-radio-wrap" htmlFor={this.props.id+"-r2"}>
                <input type="radio" name="star" value="2" checked={this.state.star === "2"} onChange={this.handleChange} className="input-radio comment-star standart-radio" id={this.props.id+"-r2"} />
                <span className="checkmark animated"></span>
              </label>
              <label className="standart-radio-wrap" htmlFor={this.props.id+"-r3"}>
                <input type="radio" name="star" value="3" checked={this.state.star === "3"} onChange={this.handleChange} className="input-radio comment-star standart-radio" id={this.props.id+"-r3"} />
                <span className="checkmark animated"></span>
              </label>
              <label className="standart-radio-wrap" htmlFor={this.props.id+"-r4"}>
                <input type="radio" name="star" value="4" checked={this.state.star === "4"} onChange={this.handleChange} className="input-radio comment-star standart-radio" id={this.props.id+"-r4"} />
                <span className="checkmark animated"></span>
              </label>
              <label className="standart-radio-wrap" htmlFor={this.props.id+"-r5"}>
                <input type="radio" name="star" value="5" checked={this.state.star === "5"} onChange={this.handleChange} className="input-radio comment-star standart-radio" id={this.props.id+"-r5"} />
                <span className="checkmark animated"></span>
              </label>
            </div></fieldset>
            <input
              type="text"
              name="name"
              className="input-text comment-name"
              placeholder="Имя"
              value={(typeof this.state.name === "undefined")?"":this.state.name}
              onChange={this.handleChange}
            />
            <br />
            <textarea
              type="text"
              name="text"
              className="textarea comment-text"
              placeholder="Комментарий"
              value={(typeof this.state.text === "undefined")?"":this.state.text}
              onChange={this.handleChange}
            />
            &nbsp;
          </div>
          <div className="g-recaptcha" data-sitekey="6LfSsm0UAAAAAHkfNuhp6eaVeGFXzL6YRUmHppoR" id={"SubDetail_Recaptcha_"+this.props.id} />
          <button id={"SubDetail_Submit_"+this.props.id} name="submit" className="standart-button">{'Добавить комментарий / Осталось: ' + this.state.session.comCount}</button>
        </form>
      </div>
    );
  }
}

module.exports = CommentForm;