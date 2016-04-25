var React = require('react');
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router  = ReactRouter.Router;
var Route = ReactRouter.Route;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');

// Firebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://blinding-heat-6110.firebaseio.com/');

/*
  App
*/

var App = React.createClass({
  getInitialState : function() {
    return {
      steps : {},
      customer : "",
      tutorialName : ""
    }
  },
  componentDidMount : function() {
    base.syncState(this.props.params.tutorialId + '/steps', {
      context : this,
      state : 'steps'
    });
    base.syncState(this.props.params.tutorialId  + '/customer', {
      context : this,
      state : 'customer'
    });
    base.syncState(this.props.params.tutorialId  + '/tutorialName', {
      context : this,
      state : 'tutorialName'
    });
  },
  render : function() {
    return (
      <div className="wrenchers-tutorial">
        <WrenchersHeader customer={this.state.customer} tutorial={this.state.tutorialName} />
        <TutorialSteps steps={this.state.steps} />
        {/*<Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>*/}
      </div>
    )
  }
});

var TutorialSteps = React.createClass({
  renderStep : function(key){
    return <Step key={key} index={key} details={this.props.steps[key]}/>
  },
  render : function() {
    return (
      <div className="container">
        {Object.keys(this.props.steps).map(this.renderStep)}
      </div>
    )
  }
})

var Step = React.createClass({
  render : function() {
    var details = this.props.details;
    var alert = details.alert;
    var components =details.components;
    return (
      <div>
        <div className="page-header" id="step1">
          {/*<img src={details.image} alt={details.name} />*/}
          <h3>{details.stepName}<br/>
            <small>{details.subtitle}</small>
          </h3>
          {/*<p>{details.desc}</p>*/}
        </div>
        {alert && <div className="alert alert-info" role="alert">{alert}</div> }
        {components && <Components components={details.components} />}
      </div>
    )
  }
})

var WrenchersHeader = React.createClass({
  render : function() {
    return (
      <div className="jumbotron">
        <div className="container">
          <h1>Let's Get Wrenching</h1>
          <p>{this.props.customer}, welcome to your customized Wrenchers Tutorial. We've curated a collection of general info, how-to videos and parts to help you work on your 
            <strong> {this.props.tutorial}</strong>
          </p>
        </div>
      </div>
    )
  }
})

var OtherComponent = React.createClass({
  render : function() {
    return (
      <div></div>
    )
  }
})

var FeaturedComponent = React.createClass({
  render : function() {
    return (
      <div></div>
    )
  }
})

var Components = React.createClass({
  renderComponent : function(key){
    return <OtherComponent key={key} index={key} details={this.props.components[key]}/>
  },
  render : function() {
    console.log(this.props.components)
    var featured = this.props.components.featuredComponent;
    var other = this.props.components.otherComponents;
    return (
      <div>
        {featured && <FeaturedComponent component={featured}/>}
        {other && Object.keys(other).map(this.renderComponent)}
      </div>
    )
  }
})

/*
  Header
  <Header/>
*/
var Header = React.createClass({
  render : function() {
    return (
      <header className="top">
      </header>
    )
  }
})

/*
  Not Found
*/

var NotFound = React.createClass({
  render : function() {
    return <h1>Not Found!</h1>
  }
});

var Home = React.createClass({
  render : function() {
    return (
      <h1>Hello world!</h1>
    )
  }
});


/*
  Routes
*/

var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={Home}/>
    <Route path="/tutorials/:tutorialId" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'));
