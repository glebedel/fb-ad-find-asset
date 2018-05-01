import React from "react";
import RaisedButton from "material-ui/RaisedButton";
import AdAccountInfo from "./AdAccountInfo";

const adsSdk = require("facebook-nodejs-ads-sdk");
const AdAccount = adsSdk.AdAccount;

const style = {};

class AdAccounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  fetchAccounts() {
    console.log("fetch adaccounts");
    window.FB.api(
      "/me",
      "GET",
      {
        fields:
          "adaccounts{id,account_id,name},accounts{name,id,perms,category}"
      },
      response => {
        console.log("adaccounts response", response);
        if (!response.error) {
          this.setState({
            accounts: response.adaccounts.data,
            pages: response.accounts.data.filter(p =>
              p.perms.includes("CREATE_ADS")
            )
          });
          if (this.state.accounts && this.state.accounts.length) {
            this.handleAccountSelect(this.state.accounts[0]);
          }
        } else {
          this.setState({ error: response.error });
        }
      }
    );
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.profile &&
      (!prevProps.profile || this.props.profile.id !== prevProps.profile.id)
    ) {
      this.fetchAccounts();
    }
  }
  handleAccountSelect = account => {
    if (this.state.selected && this.state.selected.id === account.id) {
      this.setState({ selected: undefined });
    } else {
      const accessToken = this.props.auth.authResponse.accessToken;
      const api = adsSdk.FacebookAdsApi.init(accessToken);
      api.setDebug(true);
      this.setState({
        selected: account,
        api,
        apiAdAccount: new AdAccount(account.id)
      });
    }
  };
  render() {
    const accounts =
      this.state.accounts &&
      this.state.accounts.map(adaccount => (
        <div key={adaccount.id}>
          <RaisedButton
            label={adaccount.name}
            primary={
              this.state.selected && this.state.selected.id === adaccount.id
            }
            style={style}
            onClick={() => this.handleAccountSelect(adaccount)}
          />
          <AdAccountInfo
            account={this.state.selected}
            pages={this.state.pages}
            profile={this.props.profile}
            apiAdAccount={this.state.apiAdAccount}
          />
        </div>
      ));
    return (
      <div>
        <p>Choose an ad account:</p>
        {accounts}
      </div>
    );
  }
}

export default AdAccounts;
