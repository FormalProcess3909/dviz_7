import React, { Component } from "react";
import * as d3 from "d3";

class TweetDashboard extends Component {
  componentDidMount() {
    this.createVisualization();
  }

  componentDidUpdate() {
    this.createVisualization();
  }

  createVisualization() {
    const { json_data } = this.props;

    // Clear previous SVG content
    d3.select("#dashboard").selectAll("*").remove();

    // Define dimensions
    const width = 800;
    const height = 700; // Increased height for better spacing
    const margin = { top: 50, right: 50, bottom: 50, left: 100 };

    // Create SVG canvas
    const svg = d3
        .select("#dashboard")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Scale for sentiment color
    const sentimentColorScale = d3
        .scaleLinear()
        .domain([-1, 0, 1])
        .range(["red", "#ECECEC", "green"]);

    // Group tweets by month
    const months = ["March", "April", "May"];
    const monthCenters = {
        March: margin.top + 100,
        April: height / 2,
        May: height - 100,
    };

    // Add circles for tweets
    const nodes = json_data.map((d) => ({
        ...d,
        x: width / 2 + Math.random() * 50, // Initialize random x
        y: height / 2 + Math.random() * 50, // Initialize random y
    }));

    // Create a force simulation
    const simulation = d3
        .forceSimulation(nodes)
        .force("x",d3.forceX((d) => width / 2).strength(0.05) // Horizontally center the nodes
        )
        .force("y", d3.forceY((d) => monthCenters[d.Month]).strength(0.3) // Pull nodes toward respective month clusters
        )
        .force("collide", d3.forceCollide(8)) // Increase collision radius to create proper spacing
        .on("tick", ticked);

    function ticked() {
        const circles = svg.selectAll("circle").data(nodes);

        circles
            .enter()
            .append("circle")
            .merge(circles)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 6) // Slightly larger radius for better visibility
            .attr("fill", (d) => sentimentColorScale(d.Sentiment))
            .attr("stroke", "none");

        circles.exit().remove();
    }

    // Add month labels
    svg.selectAll("text")
        .data(months)
        .enter()
        .append("text")
        .attr("x", margin.left / 2)
        .attr("y", (d) => monthCenters[d] - 70) // Position labels above clusters
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text((d) => d);
}


  render() {
    return <div id="dashboard"></div>;
  }
}

export default TweetDashboard;
