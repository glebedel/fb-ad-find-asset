import React from "react";

import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import Card from "material-ui/Card";

const adsSdk = require("facebook-nodejs-ads-sdk");
const Ad = adsSdk.Ad;
const AdCreative = adsSdk.AdCreative;
const AdStory = adsSdk.AdCreativeObjectStorySpec;
const AdCreativeLink = adsSdk.AdCreativeLinkData;

class AdCreator extends React.Component {
  constructor(props) {
    super(props);
    if (props.campaigns && props.campaigns.length) {
      this.state = {
        campaignIndex: 0,
        campaign: this.props.campaigns[0]
      };
    } else {
      this.state = {};
    }
  }
  handleSelectCampaign = (ev, index, campaignIndex) => {
    this.setState({
      campaignIndex,
      campaign: this.props.campaigns[campaignIndex]
    });
  };
  handleSelectAdset = (ev, index, adsetIndex) => {
    this.setState({
      adsetIndex,
      adset: this.state.campaign.adsets[adsetIndex]
    });
  };
  handleSelectActor = (ev, index, actorIndex) => {
    this.setState({
      actorIndex,
      actor: this.props.pages[actorIndex]
    });
  };
  handleNameChange = ev => {
    this.setState({
      name: ev.target.value
    });
  };
  handleCreativeChange = change => {
    const creative = this.state.creative || {};
    this.setState({ creative: { ...creative, ...change } });
  };
  handleStorySpecChange = change => {
    const storySpec = this.state.story || {};
    this.setState({ story: { ...storySpec, ...change } });
  };
  loadImageData = url => {
    fetch(url)
      .then(response => response.blob())
      .then(
        blob =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then(dataUrl => this.setState({ imageDataUrl: dataUrl }));
  };
  handleImageChange = ev => {
    const url = ev.target.value;
    this.loadImageData(url);
  };
  getImageHash = () => {
    return new Promise((resolve, reject) => {
      if (!this.state.imageDataUrl) {
        resolve(null);
      }
      return this.props.apiAdAccount
        .createAdImage([], {
          bytes: this.state.imageDataUrl.replace("data:image/jpeg;base64,", "")
        })
        .then(response => resolve(response.images && response.images.bytes));
    });
  };
  handleCreativeSubmit = ev => {
    ev.preventDefault();
    this.getImageHash().then(image => {
      this.props.apiAdAccount
        .createAd([], {
          [Ad.Fields.creative]: {
            ...this.state.creative,
            [AdCreative.Fields.actor_id]: this.state.actor.id,
            [AdCreative.Fields.object_story_spec]: {
              ...this.state.story,
              [AdStory.Fields.page_id]: this.state.actor.id,
              [AdStory.Fields.link_data]: {
                ...this.state.story.link_data,
                [AdCreativeLink.Fields.call_to_action]: {
                  type: "LEARN_MORE"
                },
                [AdCreativeLink.Fields.attachment_style]: "link"
              }
            },
            [AdCreative.Fields.image_hash]: image && image.hash
          },
          [Ad.Fields.adset_id]: this.state.adset.id,
          [Ad.Fields.name]: this.state.name,
          [Ad.Fields.status]: Ad.Status.paused
        })
        .then(result => console.info("ad created: ", result));
    });
    return this.setState({ createStatus: 0 });
  };

  render() {
    console.log(this.state);
    const campaignChoices =
      this.props.campaigns &&
      this.props.campaigns.map((c, i) => (
        <MenuItem key={c.id} value={i} primaryText={c.name} />
      ));
    const pagesChoices = this.props.pages.map((p, i) => (
      <MenuItem key={p.id} value={i} primaryText={p.name} />
    ));
    const adsetChoices =
      this.state.campaign &&
      this.state.campaign.adsets.map((adset, i) => (
        <MenuItem key={adset.id} value={i} primaryText={adset.name} />
      ));
    return (
      <Card>
        <form
          action="/postad"
          onSubmit={this.handleCreativeSubmit}
          method="POST"
        >
          <h2>Create ad</h2>
          <SelectField
            required={true}
            floatingLabelText="Page"
            value={this.state.actorIndex}
            onChange={this.handleSelectActor}
          >
            {pagesChoices}
          </SelectField>
          <SelectField
            required={true}
            floatingLabelText="Campaign"
            disabled={!this.props.campaigns || !this.props.campaigns.length}
            value={this.state.campaignIndex}
            onChange={this.handleSelectCampaign}
          >
            {campaignChoices}
          </SelectField>
          <SelectField
            required={true}
            floatingLabelText="Adset"
            disabled={
              !this.state.campaign || !this.state.campaign.adsets.length
            }
            value={this.state.adsetIndex}
            onChange={this.handleSelectAdset}
          >
            {adsetChoices}
          </SelectField>
          <TextField
            required={true}
            id="creator-ad-name"
            hintText="Ad Name"
            onChange={this.handleNameChange}
          />
          <TextField
            type="url"
            id="creator-ad-image"
            hintText="Ad Image URL"
            onBlur={this.handleImageChange}
          />
          {this.state.imageDataUrl && (
            <img src={this.state.imageDataUrl} alt="ad asset" />
          )}
          <TextField
            required={true}
            id="creator-ad-title"
            hintText="Creative Title"
            onChange={ev =>
              this.handleCreativeChange({ title: ev.target.value })
            }
          />
          <br />
          <TextField
            required={true}
            id="creator-ad-body"
            hintText="Creative Body"
            onChange={ev =>
              this.handleCreativeChange({ body: ev.target.value })
            }
          />
          <br />
          <TextField
            required={true}
            id="creator-ad-url"
            type="url"
            hintText="Link url"
            onChange={ev =>
              this.handleStorySpecChange({
                link_data: { link: ev.target.value }
              })
            }
          />
          <br />
          <RaisedButton
            label="Create Ad"
            type="submit"
            secondary={true}
            icon={<FontIcon className="muidocs-icon-custom-github" />}
          />
        </form>
      </Card>
    );
  }
}

export default AdCreator;
