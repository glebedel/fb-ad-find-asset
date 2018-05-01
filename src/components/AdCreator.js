import React from "react";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import FontIcon from "material-ui/FontIcon";
import Card from "material-ui/Card";
import CircularProgress from "material-ui/CircularProgress";
import Dialog from "material-ui/Dialog";
import Divider from "material-ui/Divider";

const adsSdk = require("facebook-nodejs-ads-sdk");
const Ad = adsSdk.Ad;
const AdCreative = adsSdk.AdCreative;
const AdStory = adsSdk.AdCreativeObjectStorySpec;
const AdCreativeLink = adsSdk.AdCreativeLinkData;

const styles = {
  img: {
    maxHeight: 100
  }
};
class AdCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleSelectCampaign = campaignIndex => {
    this.setState({
      campaignIndex,
      campaign: this.props.campaigns[campaignIndex]
    });
  };
  handleSelectAdset = adsetIndex => {
    this.setState({
      adsetIndex,
      adset: this.state.campaign.adsets[adsetIndex]
    });
  };
  handleSelectActor = actorIndex => {
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
  handleStoryLinkData = (change = {}) => {
    const storyLinkData = this.state.linkData || {};
    this.setState({
      linkData: { ...storyLinkData, ...change }
    });
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
              [AdStory.Fields.page_id]: this.state.actor.id,
              [AdStory.Fields.link_data]: {
                ...this.state.linkData,
                [AdCreativeLink.Fields.call_to_action]: {
                  type: "LEARN_MORE"
                },
                [AdCreativeLink.Fields.attachment_style]: "link",
                [AdCreative.Fields.image_hash]: image && image.hash
              }
            },
            [AdCreative.Fields.image_hash]: image && image.hash,
            [AdCreative.Fields.image_url]: image && image.url
          },
          [Ad.Fields.adset_id]: this.state.adset.id,
          [Ad.Fields.name]: this.state.name,
          [Ad.Fields.status]: Ad.Status.paused
        })
        .then(result => {
          console.info("ad created: ", result);
          if (result.id) {
            return this.setState({ createStatus: 2 });
          }
        })
        .catch(err => {
          this.setState({ createStatus: -1, error: err });
        });
    });
    return this.setState({ createStatus: 1 });
  };
  handleDialogClose = () => {
    this.setState({
      createStatus: 0
    });
  };
  componentDidUpdate() {
    if (
      this.state.campaignIndex === undefined &&
      this.props.campaigns &&
      this.props.campaigns.length
    ) {
      this.handleSelectCampaign(0);
    }
    if (
      this.state.actorIndex === undefined &&
      this.props.pages &&
      this.props.pages.length
    ) {
      this.handleSelectActor(0);
    }
    if (
      this.state.adsetIndex === undefined &&
      this.state.campaign &&
      this.state.campaign.adsets.length
    ) {
      this.handleSelectAdset(0);
    }
  }
  render() {
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
        <Dialog
          title={this.state.createStatus === 2 ? "Success" : "Error"}
          actions={[
            <FlatButton
              label="Close"
              primary={true}
              keyboardFocused={true}
              onClick={this.handleDialogClose}
            />
          ]}
          modal={false}
          open={this.state.createStatus === -1 || this.state.createStatus === 2}
          onRequestClose={this.handleDialogClose}
        >
          {this.state.createStatus === 2 &&
            "Ad '" + this.state.name + "' was created successfully"}
          {this.state.createStatus === -1 &&
            "Error was encountered while trying to create an ad: " +
              this.state.error.name}
        </Dialog>
        <form
          action="/postad"
          onSubmit={this.handleCreativeSubmit}
          method="POST"
        >
          <h2>Create ad</h2>
          <SelectField
            required={true}
            floatingLabelText="Campaign"
            disabled={!this.props.campaigns || !this.props.campaigns.length}
            value={this.state.campaignIndex}
            onChange={(ev, index, campaignIndex) =>
              this.handleSelectCampaign(campaignIndex)
            }
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
            onChange={(ev, index, adsetIndex) =>
              this.handleSelectAdset(adsetIndex)
            }
          >
            {adsetChoices}
          </SelectField>
          <SelectField
            required={true}
            floatingLabelText="Page"
            value={this.state.actorIndex}
            onChange={(ev, index, actorIndex) =>
              this.handleSelectActor(actorIndex)
            }
          >
            {pagesChoices}
          </SelectField>
          <Divider />
          <TextField
            required={true}
            id="creator-ad-name"
            hintText="Ad Name"
            onChange={this.handleNameChange}
          />
          <Divider />
          <TextField
            type="url"
            id="creator-ad-image"
            hintText="Ad Image URL"
            onBlur={this.handleImageChange}
          />
          {this.state.imageDataUrl && (
            <img
              src={this.state.imageDataUrl}
              style={styles.img}
              alt="ad asset"
            />
          )}
          <Divider />
          <TextField
            id="creator-ad-headline"
            hintText="Creative Headline"
            onChange={ev => {
              this.handleCreativeChange({ title: ev.target.value });
              this.handleStoryLinkData({ name: ev.target.value });
            }}
          />
          <Divider />
          <TextField
            id="creator-ad-body"
            hintText="Creative Body"
            onChange={ev => {
              this.handleCreativeChange({ body: ev.target.value });
              this.handleStoryLinkData({ description: ev.target.value });
            }}
          />
          <Divider />
          <TextField
            required={true}
            id="creator-ad-url"
            type="url"
            hintText="Link url"
            onChange={ev => {
              this.handleCreativeChange({ link: ev.target.value });
              this.handleStoryLinkData({ link: ev.target.value });
            }}
          />
          <Divider />
          {(this.state.createStatus === 1 && <CircularProgress />) || (
            <RaisedButton
              label="Create Ad"
              type="submit"
              secondary={true}
              icon={<FontIcon className="muidocs-icon-custom-github" />}
            />
          )}
        </form>
      </Card>
    );
  }
}

export default AdCreator;
