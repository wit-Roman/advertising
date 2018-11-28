const React = require('react');
const Detail = require('./Detail.jsx');
const ReactDOM = require('react-dom');

class SubDetail extends React.Component {
    componentDidMount() {
        const id = this.props.id;
        const body_elem = document.getElementById("SubDetail_"+id);
        body_elem.innerHTML='<img src="img/wait.svg" />';
        const xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open('get', '/'+id, !0);
        xhr.setRequestHeader("X-Requested-With","xmlhttprequest");
        xhr.send();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) 
                ReactDOM.render(<Detail {...this.response} />, body_elem);
        }
    }
    render() {
        return (
            <div className="container">
                <div id={"SubDetail_"+this.props.id} />
            </div>
        );
    }
}
module.exports = SubDetail;
