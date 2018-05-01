import React, { Component } from "react";
import logo from "./logo.svg";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import FB_CONFIG from "./configs/Facebook";
import FacebookBtn from "./components/FacebookBtn";
import AdAccounts from "./components/AdAccounts";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    // this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: FB_CONFIG.appId,
        cookie: true, // enable cookies to allow the server to access the session
        // xfbml: true, // parse social plugins on this page
        version: "v2.12" // use version 2.12
      });

      // Now that we've initialized the JavaScript SDK, we call
      // FB.getLoginStatus().  This function gets the state of the
      // person visiting this page and can return one of three states to
      // the callback you provide.  They can be:
      //
      // 1. Logged into your app ('connected')
      // 2. Logged into Facebook, but not your app ('not_authorized')
      // 3. Not logged into Facebook and can't tell if they are logged into
      //    your app or not.
      //
      // These three cases are handled in the callback function.
      window.FB.getLoginStatus(
        function(response) {
          this.statusChangeCallback(response);
        }.bind(this)
      );
    }.bind(this);

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }

  // test graph api by getting basic profile data
  testAPI = () => {
    console.log("Welcome!  Fetching your information.... ");
    window.FB.api("/me", response => {
      console.log("Successful login for: " + response.name);
      this.setState({ profile: response });
    });
  };

  // This is called with the results from from FB.getLoginStatus().
  statusChangeCallback = response => {
    console.log("statusChangeCallback");
    console.log(response);
    if (response.status === "connected") {
      // Logged into app and Facebook.
      this.testAPI();
    }
    this.setState({ auth: response });
  };

  // callback called when fb login button action finished
  checkLoginState = (...args) => {
    console.log("check login state -", args);
    window.FB.getLoginStatus(this.statusChangeCallback);
  };

  handleClick = () => {
    window.FB.login(this.checkLoginState, {
      scope: FB_CONFIG.scope,
      return_scopes: true
    });
  };
  render() {
    const msg = this.state.profile ? (
      <div>Welcome {this.state.profile.name}!</div>
    ) : (
      <FacebookBtn clickHandler={this.handleClick} />
    );
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Ad Upper</h1>
          </header>
          <div className="App-intro">{msg}</div>
          <AdAccounts profile={this.state.profile} auth={this.state.auth} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
