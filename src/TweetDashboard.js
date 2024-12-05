import React, { Component } from "react";
import * as d3 from "d3";

class TweetDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorBy: "Sentiment", // Default coloring metric
      selectedTweets: [], // Tweets selected by the user
    };
  }

  componentDidMount() {
    this.renderVisualization();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data !== this.props.data ||
      prevState.colorBy !== this.state.colorBy
    ) {
      this.renderVisualization();
    }
  }

  renderVisualization = () => {
    const { data } = this.props;

    // Check if data exists and is not empty
    if (!data || data.length === 0) {
      console.warn("No data available for visualization.");
      return;
    }

    const width = 800;
    const height = 600;

    // Remove existing SVG to avoid duplicates
    d3.select("#visualization").selectAll("*").remove();

    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Define color scales
    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const colorScale =
      this.state.colorBy === "Sentiment"
        ? sentimentColorScale
        : subjectivityColorScale;

    // Define X positions for each month
    const xScale = d3
      .scalePoint()
      .domain(["March", "April", "May"])
      .range([200, 600]);

    // Force simulation
    const simulation = d3
      .forceSimulation(data)
      .force(
        "x",
        d3.forceX((d) => xScale(d.Month)).strength(0.05)
      )
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collide", d3.forceCollide(10))
      .stop();

    // Run simulation
    for (let i = 0; i < 120; ++i) simulation.tick();

    // Render circles
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d[this.state.colorBy]))
      .attr("stroke", "none")
      .attr("stroke-width", 2)
      .on("click", (event, d) => this.handleCircleClick(d));

    // Add labels for months
    svg
      .selectAll("text")
      .data(["March", "April", "May"])
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d))
      .attr("y", 50)
      .text((d) => d)
      .attr("text-anchor", "middle")
      .style("font-size", "16px");
  };

  handleCircleClick = (tweet) => {
    const { selectedTweets } = this.state;
    const alreadySelected = selectedTweets.find((t) => t.idx === tweet.idx);

    if (alreadySelected) {
      // Remove tweet from selection
      this.setState({
        selectedTweets: selectedTweets.filter((t) => t.idx !== tweet.idx),
      });
    } else {
      // Add tweet to selection
      this.setState({
        selectedTweets: [tweet, ...selectedTweets],
      });
    }
  };

  render() {
    const { data } = this.props;
    const { selectedTweets } = this.state;

    // Show dropdown and selected tweets only if data is loaded
    return (
      <div>
        {data && data.length > 0 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label>Color By: </label>
              <select
                onChange={(e) => this.setState({ colorBy: e.target.value })}
              >
                <option value="Sentiment">Sentiment</option>
                <option value="Subjectivity">Subjectivity</option>
              </select>
            </div>
          </div>
        )}
        <div id="visualization"></div>
        {data && data.length > 0 && (
          <div>
            <h3>Selected Tweets:</h3>
            {selectedTweets.map((tweet) => (
              <div
                key={tweet.idx}
                style={{ border: "1px solid black", padding: 10, margin: 5 }}
              >
                {tweet.RawTweet}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default TweetDashboard;
