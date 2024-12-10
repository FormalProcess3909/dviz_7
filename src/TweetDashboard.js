import React, { Component } from "react";
import * as d3 from "d3";
import "./TweetDashboard.css";

class TweetDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sentiment: true, // Default to sentiment-based coloring
    };
  }

  componentDidMount() {
    this.createVisualization();
  }

  componentDidUpdate() {
    this.createVisualization();
  }

  createVisualization() {
    const { json_data } = this.props;
    const { sentiment } = this.state;

    // Clear previous visualization
    d3.select("#dashboard").selectAll("*").remove();

    // Define dimensions
    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    // Create SVG elements
    const svg = d3
      .select("#dashboard")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    // Month centers
    const monthCenters = {
      March: 50,
      April: 200,
      May: 350,
    };

    // Force simulation
    const simulation = d3
      .forceSimulation(json_data)
      .force("x", d3.forceX((d) => width / 2).strength(0.05))
      .force("y", d3.forceY((d) => monthCenters[d.Month]).strength(0.5))
      .force("collide", d3.forceCollide(8))
      .on("tick", ticked);

    function ticked() {
      const circles = svg.selectAll("circle").data(json_data, (d) => d.Idx);

      circles
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("fill", (d) =>
          sentiment
            ? sentimentColorScale(d.Sentiment)
            : subjectivityColorScale(d.Subjectivity)
        )
        .merge(circles)
        .attr("cx", (d) => d.x + (width / 2 - margin.left - margin.right - 400) / 2)
        .attr("cy", (d) => d.y)
        .on("click", function (e, d) {
          const selected = d3.select(this);
          if (selected.attr("stroke") === "black") {
            selected.attr("stroke", "none");
            d3.select(`.tweetText${d.Idx}`).remove();
          } else {
            selected.attr("stroke", "black");
            d3.select(".tweets")
              .append("p")
              .attr("class", `tweetText${d.Idx}`)
              .text(d.RawTweet);
          }
        });

      circles.exit().remove();
    }

    // Add month labels
    svg
      .selectAll(".monthLabel")
      .data(Object.keys(monthCenters))
      .join("text")
      .attr("class", "monthLabel")
      .attr("x", 10)
      .attr("y", (d) => monthCenters[d])
      .text((d) => d);

    // Add legend
    const legend = d3
      .select("#dashboard")
      .append("svg")
      .attr("width", 100)
      .attr("height", 600)
      .style("overflow", "visible")
      .attr("transform", `translate(${width / 2 - 300}, ${margin.top})`);

    const gradientData = sentiment
      ? d3.range(-1, 1.1, 0.1)
      : d3.range(0, 1.05, 0.05);

    legend
      .selectAll(".gradientSquare")
      .data(gradientData)
      .join("rect")
      .attr("class", "gradientSquare")
      .attr("x", 10)
      .attr("y", (d, i) => i * 10)
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", (d) =>
        sentiment ? sentimentColorScale(d) : subjectivityColorScale(d)
      );

    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 10)
      .text(sentiment ? "Positive" : "Subjective");
    legend
      .append("text")
      .attr("x", 35)
      .attr("y", 220)
      .text(sentiment ? "Negative" : "Objective");
  }

  toggleColorScheme = (e) => {
    this.setState({ sentiment: e.target.value === "sentiment" });
  };

  render() {
    return (
      <>
        <div>
          <label htmlFor="colorBy">Color By: </label>
          <select id="colorBy" onChange={this.toggleColorScheme}>
            <option value="sentiment">Sentiment</option>
            <option value="subjectivity">Subjectivity</option>
          </select>
        </div>
        <div id="dashboard"></div>
        <div className="tweets"></div>
      </>
    );
  }
}

export default TweetDashboard;
