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
  Usage: component={app}
  This is the main application, which is accessed via a valid tutorial ID.
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
    // There's probably a better way of doing this
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
        <Footer />
      </div>
    )
  }
});

/*
  TutorialSteps
  Usage: <TutorialSteps/>
  Renders all steps for a given tutorial.
*/
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

/*
  Step
  Usage: <Step/>
  Renders an individual step within the tutorial.
*/
var Step = React.createClass({
  render : function() {
    var details = this.props.details;
    var alert = details.alert;
    var components =details.components;
    return (
      <div>
        <div className="page-header" id="step1">
          <h3>{details.stepName}<br/>
            <small>{details.subtitle}</small>
          </h3>
        </div>
        {alert && <div className="alert alert-info" role="alert">{alert}</div> }
        {components && <Components components={details.components} />}
      </div>
    )
  }
})

/*
  Components
  Usage: <Components/>
  Renders all the components for a given step in the tutorial.
*/
var Components = React.createClass({
  // Render method for a regular, non-featured component.
  renderComponent : function(key){
    return <OtherComponent key={key} index={key} details={this.props.components.otherComponents[key]}/>
  },
  render : function() {
    var featured = this.props.components.featuredComponent;
    var other = this.props.components.otherComponents;
    var tools = this.props.components.toolsList;
    // These classes are abstracted out here so that they can be easily modified.
    var fClass = "col-sm-6 col-md-3";
    var oClass = "col-sm-6 col-md-9";

    return (
      <div className="row">
          {featured &&  // if this component contains a featured component, render it
            <div className={fClass}>
              <FeaturedComponent component={featured}/>
            </div>
          }
          {other && // if this component contains any other non-featured components, render it
            <div className={oClass}>
              {Object.keys(other).map(this.renderComponent)}
            </div>
          }
          {tools && // if this component contains a tools list component, render it
            <ToolsList tools={tools}/>
          }
      </div>
    )
  }
})

/*
  FeaturedComponent
  <FeaturedComponent/>
  Renders a super awesome featured component.
*/
var FeaturedComponent = React.createClass({
  render : function() {
    return (
        <div className="thumbnail">
          {(() => {
            switch (this.props.component.componentType) {
              case "image": return (<FeaturedImage component={this.props.component}/>);
              case "video": return (<FeaturedVideo component={this.props.component}/>);
              // Featured items should only be either images or videos, but this will return
              // an empty div in case that FeaturedComponent is invoked improperly.
              default:      return (<div></div>);
            }
          })()}
        </div>
    )
  }
})

/*
  OtherComponent
  Usage: <OtherComponent/>
  Renders a regular non-featured component.
*/
var OtherComponent = React.createClass({
  render : function() {
    var styles = {height: '120px',width: '120px'};
    var details = this.props.details;
    var image = details.image;
    return (
      <div className="media">
        <div className="media pull-left">
          {image && // if this component has a corresponding image, render it
            <a href={details.contentLink}>
              <img className="media-object" src={image} alt="..." style={styles}/>
            </a>
          }
        </div>
        <div className="media-body">
          <h4 className="media-heading">{details.heading}</h4>
          <p>{details.textPreview}<a href={details.contentLink}>Read More</a></p>
        </div>
      </div>
    )
  }
})

/*
  Caption
  Usage: <Caption/>
  Renders captions for the images and videos within featured components.
*/
var Caption = React.createClass({
  render : function() {
    return (
      <div className="caption">
        <h4>{this.props.text}</h4>
        <p>From <a href={this.props.link}>{this.props.source}</a></p>
      </div>
    )
  }
})

/*
  FeaturedVideo
  Usage: <FeaturedVideo/>
  Renders a video within a featured component.
*/
var FeaturedVideo = React.createClass({
  render : function() {
    var details = this.props.component;
    return (
      <div>
        <div className="embed-responsive embed-responsive-16by9">
            <iframe className="embed-responsive-item" src={details.videoSource}></iframe>
        </div>
        <Caption text={details.captionText} link={details.contentLink} source={details.contentLinkSource} />
      </div>
    )
  }
})

/*
  FeaturedImage
  Usage: <FeaturedImage/>
  Renders an image within a featured component.
*/
var FeaturedImage = React.createClass({
  render : function() {
    var details = this.props.component;
    return (
      <div>
        <a href={details.imagePath}>
            <img src={details.imagePath} alt="..."/>
        </a>
        <Caption text={details.captionText} link={details.contentLink} source={details.contentLinkSource} />
      </div>
    )
  }
})

/*
  Tool
  Usage: <Tool/>
  Renders information for a specific tool.
*/
var Tool = React.createClass({
  render : function() {
    var details = this.props.details;
    var image = details.image;
    var imageStyles = {height: '225px'};
    return (
      <div className="col-sm-6 col-md-3">
        <div className="thumbnail">
            {image && // if this component has a corresponding image, render it
              <a href={details.itemLink}>
                <img src={image} alt="..." style={imageStyles}/>
              </a>
            }
            <div className="caption download-block text-center">
              <h5>{details.itemName}</h5>
              <p>
                <a href={details.itemLink} className="btn-download" role="button">{details.purchasingInfo}</a> 
              </p>
            </div>
        </div>
      </div>
    )
  }
})

/*
  ToolsList
  Usage: <ToolsList/>
  Renders information for a tool, including image and a link to purchase.
*/
var ToolsList = React.createClass({
  renderTool : function(key){
    return <Tool key={key} index={key} details={this.props.tools[key]}/>
  },
  render : function() {
    var tools = this.props.tools;
    return (
      <div className="row">
        {Object.keys(tools).map(this.renderTool)}
      </div>
    )
  }
})

/*
  WrenchersHeader
  Usage: <WrenchersHeader/>
  Renders that beautiful Wrenchers branded header that you've come to know and love.
*/
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

/*
  Footer
  Usage: <Footer/>
  Renders a Wrenchers footer with all sorts of juicy information.
*/
var Footer = React.createClass({
  render : function() {
    return (
      <footer id="footer">
      <div className="trans-bg">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 text-center">
               <div className="copyright">
                <p>&copy; <span>The Wrenchers Project</span>2016, Some rights reserved</p>
              </div>
                <p>steven@wrenchers.co</p>
            </div>
            </div>
          </div>
        <div id="go-to-top">
            <a href="#banner"></a>
        </div>
      </div>
      </footer>
    )
  }
})

/*
  NotFound
  Usage: component={NotFound}
  This should be some kinda 404 page for if someone finds themselves astray.
*/
var NotFound = React.createClass({
  render : function() {
    return <h1>Not Found!</h1>
  }
});

/*
  Home
  Usage: component={Home}
  This should be some kinda landing page for if someone goes to the site home page.
*/
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
