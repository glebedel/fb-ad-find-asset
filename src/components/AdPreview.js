import React from "react";

class AdPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  createPreview() {
    const adsSdk = require("facebook-nodejs-ads-sdk");
    const accessToken = "<VALID_ACCESS_TOKEN>";
    const api = adsSdk.FacebookAdsApi.init(accessToken);
    const AdAccount = adsSdk.AdAccount;
    const Campaign = adsSdk.Campaign;
    const account = new AdAccount("act_<AD_ACCOUNT_ID>");
    account
      .createCampaign([], {
        [Campaign.Fields.name]: "Page likes campaign",
        [Campaign.Fields.status]: Campaign.Status.paused,
        [Campaign.Fields.objective]: Campaign.Objective.page_likes
      })
      .then(campaign => {})
      .catch(error => {});
  }
  componentDidUpdate(prevProps) {
  }
  render() {
    return (
      <div>
        <h2> ad infos</h2>
        {JSON.stringify(this.state)}
      </div>
    );
  }
}

export default AdPreview;
