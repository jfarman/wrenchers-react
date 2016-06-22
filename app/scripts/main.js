var React = require('react');
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router  = ReactRouter.Router;
var Route = ReactRouter.Route;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');
var classNames = require('classnames');

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
      tutorialName : "",
      showModal: true
    }
  },
  close(){
    this.setState({ showModal: false });
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
        <TermsModal show={this.state.showModal} onHide={this.close}/>
        <WrenchersHeader customer={this.state.customer} tutorial={this.state.tutorialName} />
        <TutorialSteps steps={this.state.steps} />
        <FormLinkButton />
        <Footer />
      </div>
    )
  }
});

var TermsModal = React.createClass({
  render : function() {
    var modalStyle = { display: 'block' };
    var buttonStyle = { background: '#333333' };
    var buttonStyleHidden = { display: 'none'} 

    return (
      <div className={classNames('modal', { hidden: !this.props.show}) } style={modalStyle}>
         <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1> title </h1>
              </div>
              <div className="modal-body">
                <p> test of modal text </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-download close" onClick={this.props.onHide} style={buttonStyle}>I Agree</button>
              </div>
            </div>
          </div>
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
    var list = details.list;
    var components =details.components;

    var headerStyle = (list && list.headerStyle);
    var componentElements = (components) ? <Components components={components} /> : <div></div>;
    var listElement = (list) ? <List list={list}/> : <div></div>;
    var listStyle = (components.featuredComponent) ? "col-sm-6 col-md-9" : "";

    return (
      <div>
        <div className="page-header" id="step1">
          <h3>{details.stepName}<br/>
            <small>{details.subtitle}</small>
          </h3>
        </div>
        {alert && <div className="alert alert-info" role="alert">{alert}</div> }
        {headerStyle ?
          <div>{listElement} {componentElements}</div> :
          <div>{componentElements}<div>{listElement}</div></div>
        }
      </div>
    )
  }
})

var ListItem = React.createClass({
  render : function() {
    var item = this.props.details;
    return (
      <li>{this.props.index}. {item}</li>
    )
  }
})

/*
  List
  Usage: <List/>
  Lists out stuff like 1 2 3 4 5 etc
*/
var List = React.createClass({
  // Render method for a list item
  renderComponent : function(key){
    return <ListItem key={key} index={key} details={this.props.list.listItems[key]}/>
  },
  render : function() {
    var list = this.props.list;
    var title = list.title; // LISTS NEED TO HAVE A TITLE
    var subtitle = list.subtitle; // OPTIONAL SUBTITLE
    return (
      <div className="media-body">
        <h4 className="media-heading">{title}</h4>
        {subtitle && <li><strong>{subtitle}</strong></li>}
        <div>
          {Object.keys(list.listItems).map(this.renderComponent)}
        </div>
        <a href={list.contentLink}>Read More</a>
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
              case "slideshow": return (<FeaturedImage component={this.props.component}/>);
              // Featured items should only be either images, videos, or slideshows, 
              // but this will return an empty div in case that FeaturedComponent 
              // is invoked improperly.
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
        {(this.props.componentType=="slideshow") &&
          <div className="download-block">
            <a href="http://www.hotrod.com/how-to/chassis-suspension/mopp-0402-rebuilding-front-suspensions-with-pst/#photo-07" className="btn-download" role="button">View Slideshow</a>
          </div>}
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
        <Caption componentType={details.componentType} 
                 text={details.captionText} 
                 link={details.contentLink} 
                 source={details.contentLinkSource} />
      </div>
    )
  }
})

/*
  FeaturedImage
  Usage: <FeaturedImage/>
  Renders an image within a featured component.
  Used for both SLIDESHOW and IMAGE types of featured components.
*/
var FeaturedImage = React.createClass({
  render : function() {
    var details = this.props.component;
    return (
      <div>
        <a href={details.imagePath}>
            <img src={details.imagePath} alt="..."/>
        </a>
        <Caption componentType={details.componentType} 
                 text={details.captionText} 
                 link={details.contentLink} 
                 source={details.contentLinkSource} />
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
      <div className="wrenchers-home">
        <Preloader />
        <Header />
        <Banner />
        <Introduction />
        <IntroductionVideo />
        <Support />
        <Footer />
      </div>
    )
  }
});

var Preloader = React.createClass({
  render : function() {
    return (
      <div id="faceoff">
        <div id="preloader"></div>
        <div className="preloader-section"></div>
      </div>
    )
  }
});

var Header = React.createClass({
  render : function() {
    return(
      <header id="home" className="navbar-fixed-top">
        <nav className="navbar navbar-default" role="navigation">
          <div className="container">
            <div className="row">
              <div className="col-sm-3">
                {/* Brand and toggle get grouped for better mobile display */}
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <h1><a className="nav-brand" href="#banner"> <img src="../assets/images/logoNav.jpg" alt="Wrenchers"/></a></h1>
                </div>
              </div>
              <div className="col-sm-9">
                {/* Collect the nav toggling */}
                <div className="collapse navbar-collapse navbar-example" id="bs-example-navbar-collapse-1">
                  <ul className="nav navbar-nav">
                    <li><a href="#intro">Services</a></li>
                    <li><a href="#video">Testimonials</a></li>
                    <li><a href="#support">Our Team</a></li>
                    <li><a href="#footer">Contact</a></li>
                    <li><a href="#">Blog</a></li>
                  </ul>             
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    )
  }
});

var Banner = React.createClass({
  render: function() {
    return (
      <section id="banner" className="banner norm-img">
        <div className="trans-bg">
        {/*
        <div className="lg-logo">
          <img src="../assets/images/logo.png"></img>         
        </div>
        */}
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12">   
                <div className="banner-img"></div>
                <div className="download-block text-center">
                  <a href="http://goo.gl/forms/XjqxEnVhDa" className="btn-download" target="_blank">Get a Beta Tutorial</a>
                </div>
                {/*              
                  <h2><a href="" className="lg-logo">The best way to learn how to work on a car.</a></h2>
                  <div className="flex_text text-slider">
                    <ul className="slides">
                      <li>Get matched with experienced mechanic mentors.</li>
                      <li>Gain confidence and knowldege about cars &amp; motorcycles.</li>
                    </ul>
                  </div>
                  <ul className="app">
                    <li><a href=""><i className="fa fa-apple"></i></a></li>
                    <li><a href=""><i className="fa fa-android"></i></a></li>
                    <li><a href=""><i className="fa fa-windows"></i></a></li>
                  </ul>
                */} 
              </div>
            </div>
          </div>
          {/*
          <div className="mentor-block text-center">
            <a href="http://goo.gl/forms/3aw9U5FDgd" class="btn" target="_blank">Get a Beta Tutorial</a>
          </div>
          */}
        </div>                          
      </section>
    )
  }
});

var Introduction = React.createClass({
  render: function() {
    return (
      <section id="intro" className="intro white">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 text-center">
              <span className="sub-head wow fadeInLeft">Services</span>
              <div className="title wow fadeInRight">
                <h2>The Wrenchers Journey</h2>
              </div>
            </div>
          </div>
          {/*
          <div class='col-sm-6'>
            <div class='service-img'>
              <img src="../assets/images/services.jpg"></img>
            </div>
          </div>
          */}
          <div className="row service-description">
            <div className="col-sm-2"></div>
            <div className='col-sm-8 text-center'>
              <p>Wrenchers gives you the skills and knowledge you need to keep your car on the road. We give you those skills through personalized mentorship, and curated information, parts, and tools.</p>
            </div>
            <div className="col-sm-2"></div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <div className="app-block wow bounceInUp" data-wow-delay=".1s">
                  <i className="fa"><img src="../assets/images/icons/tutorials.png"/></i>
                  <h3>Personalized Tutorials</h3>
                  <p>Receive personalized video and how-to tutorials to help you with the exact procedures of your specific make and model of car. </p>
                </div>            
            </div>
            <div className="col-sm-4">
              <div className="app-block wow bounceInUp" data-wow-delay=".2s">
                <i className="fa"><img src="../assets/images/icons/partsNTools.png"/></i>
                <h3>Curated Parts &amp; Tool Kits</h3>
                <p>No more guess work. Wrenchers bundles the tools and parts needed to perform the specific procedures and tasks you''re working on.</p>
              </div>            
            </div>
            <div className="col-sm-4">
              <div className="app-block wow bounceInUp" data-wow-delay=".3s">
                <i className="fa icon-wide"><img src="../assets/images/icons/mentorship.png"/></i>
                <h3>Mentorship On-Demand</h3>
                <p>Receive expert mechanic help when you need it. We''ll pair you with industy vetrens that are trained to help you solve your car''s problems.</p>
              </div>
            </div>
          </div>
          <div className="download-block text-center">
            <a href="http://goo.gl/forms/XjqxEnVhDa" className="btn-download" target="_blank">Get a Personalized Tutorial</a>
          </div>
        </div>
      </section>
    )
  }
})

var IntroductionVideo = React.createClass({
  render: function() {
    return (
      <section id="video" className="video">
        <div id="trans-bg" className="trans-bg">
          <div className="video-container"><div id="player"></div><div class="video-mask"></div></div>
          <div className="container">
            <div className="row">
              <div className="col-sm-12 text-center">
                <div className="video-mask">
                  <h2 className="wow bounceInDown">Testimonial</h2>
                  <iframe src="https://www.youtube.com/embed/vkgyNTczz9A?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
                  <span className="wow bounceInUp">watch video</span>
                </div>            
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
});

var Support = React.createClass({
  render : function() {
    return (
      <section id="support" className="support white">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 text-center">
            <span className="sub-head wow fadeInLeft">Our Team</span>
            <div className="title wow fadeInRight">
              <h2>The Wrenchers Team</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 wow bounceInUp" data-wow-duration="1s">
            <div className="support-block">
              <span className="support-icon fa"><img src="../assets/images/carey.png"/></span>
              <h3>Carey Smith</h3>
              <p>Masters in Design, Stanford University. For Carey, Wrenchers marries his two major passions in life, design and motorsports.
                <br/><br/><br/><br/>
              </p>
            </div>
          </div>
          <div className="col-sm-3 wow bounceInUp" data-wow-duration="2s">
            <div className="support-block">
              <span className="support-icon fa"><img src="../assets/images/will.png"/></span>
              <h3>Will Meadows</h3>
              <p>Masters in Design, Stanford University. He has worked in strategy for both his own family wine and property company as well as for start-ups and larger companies like IKEA.
                <br/><br/>
              </p>
            </div>
          </div>
          <div className="col-sm-3 wow bounceInUp" data-wow-duration="3s">
            <div className="support-block">
              <span className="support-icon fa"><img src="../assets/images/mingming.png"/></span>
              <h3>Mingming Jiang</h3>
              <p>Masters in Learning, Technology, and Design, Stanford University. Mingming has a passion for designing innovative educational curriculums, particularly around mechanical problems.</p>
            </div>
          </div>
          <div className="col-sm-3 wow bounceInUp" data-wow-duration="3s">
            <div className="support-block">
              <span className="support-icon fa"><img src="../assets/images/steven.png"/></span>
              <h3>Steven Willinger</h3>
              <p>MBA Stanford University. Steven draws an appreciation of fast paced business models and products that can scale from his 6 years in business development at Google X.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    )
  }
});

var FormLinkButton = React.createClass({
  render: function() {
    return (
      <div>
        <div className="app-block">
          <h3>Help us improve our service!</h3>
        </div>
        <div className="download-block text-center">
          <a href="#" className="btn-download" target="_blank">Fill out survey</a>
        </div>
      </div>
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
