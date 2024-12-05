import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import TweetDashboard from "./TweetDashboard";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  set_data = (json_data) => {
    this.setState({ data: json_data });
  };

  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <TweetDashboard json_data={this.state.data}></TweetDashboard>
        </div>
      </div>
    );
  }
}

export default App;
