import React from "react";
import AdCreator from "./AdCreator";

const style = {
  margin: 12
};

class AdAccountInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  fetchCampaigns(accountId) {
    console.log("fetch ad helpers");
    window.FB.api(
      `/${accountId}`,
      "GET",
      {
        fields:
          "name,account_id,business,campaigns{name,id,account_id,status,adsets{name,id,status,targeting,optimization_goal},kpi_type,objective,created_time,buying_type,configured_status,effective_status,source_campaign,recommendations},adcreatives{body,image_url,image_hash,name,status,link_url,object_type,object_story_spec,title,link_og_id,video_id,object_id,object_story_id,object_url,id,call_to_action_type,adlabels,platform_customizations,recommender_settings,asset_feed_spec,product_set_id,template_url,template_url_spec}"
      },
      response => {
        console.log("ad helpers response", response);
        if (!response.error) {
          this.setState({
            campaigns: response.campaigns.data.map(c => ({
              ...c,
              adsets: c.adsets.data
            })),
            creatives: response.adcreatives.data
          });
        } else {
          this.setState({ error: response.error });
        }
      }
    );
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.account &&
      (!prevProps.account || this.props.account.id !== prevProps.account.id)
    ) {
      this.fetchCampaigns(this.props.account.id);
    }
  }
  render() {
    return (
      <div>
        {this.props.account && this.props.pages.length && (
          <AdCreator
            accountId={this.props.account.id}
            profile={this.props.profile}
            apiAdAccount={this.props.apiAdAccount}
            pages={this.props.pages}
            creatives={this.state.creatives}
            campaigns={this.state.campaigns}
          />
        )}
      </div>
    );
  }
}

export default AdAccountInfo;
