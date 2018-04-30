import React from "react";

class Pages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  fetchPosts(pageId){
    console.log('fetch posts');
    window.FB.api(`${pageId}/feed`,
  "GET",
{fields:'message, created_time, updated_time, picture'})
  }
  fetchPages() {
    console.log("fetch pages");
    window.FB.api(
      "/me/accounts",
      "GET",
      { fields: "link,id,name,about,picture", limit: "10" },
      response => {
        console.log("pages response", response);
        if (!response.error) {
          this.setState({ pages: response.data });
        } else {
          this.setState({ error: response.error });
        }
      }
    );
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.selected &&
      this.props.selected.id !== prevProps.selected.id
    ) {
    }
    // fetch pages if profile wasn't set before (avoids infinite fetching)
    if (!prevProps.profile && this.props.profile) {
      this.fetchPages();
    }
  }
  handlePageSelect = page => {
    this.setState({ selected: page });
  };
  render() {
    const pages =
      this.state.pages &&
      this.state.pages.map(page => (
        <li>
          <div key={page.id} onClick={() => this.handlePageSelect(page)}>
            <img src={page.picture.data.url} alt={page.name} />
            <span>{page.name}</span>
          </div>
          <a target="_blank" href={page.link}>
            goto
          </a>
        </li>
      ));
    return (
      <div>
        <h2> Page list</h2>
        <ul>{pages}</ul>
      </div>
    );
  }
}

export default Pages;
