import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.debugMode = false; // Set to true to render the chart for testing
  }

  componentDidMount() {
    if (this.debugMode && this.props.csv_data.length > 0) {
      this.drawStreamgraph(this.props.csv_data);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.csv_data !== this.props.csv_data &&
      this.props.csv_data.length > 0
    ) {
      this.drawStreamgraph(this.props.csv_data);
    }
  }

  drawStreamgraph(data) {
    // Clear previous graph
    d3.select(this.chartRef.current).select("svg").remove();

    // Set dimensions and margins
    const margin = { top: 20, right: 150, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append SVG
    const svg = d3
      .select(this.chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];
    data.forEach((d) => {
      keys.forEach((key) => (d[key] = +d[key]));
    });

    // Stack data
    const stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle);
    const stackedData = stack(data);

    // Define scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])),
        d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])),
      ])
      .range([height, 0]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]);

    // Create area generator
    const area = d3
      .area()
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCatmullRom); // Smooth curves

    // Create the tooltip div
    const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("pointer-events", "none")
    .style("opacity", 0);
  

    // Add layers
    svg
      .selectAll("path")
      .data(stackedData)
      .join("path")
      .attr("d", area)
      .style("fill", (d) => colorScale(d.key))
      .style("stroke", "none")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX - 300 / 2}px`)
          .style("top", `${event.pageY}px`);
      
        this.drawMiniBarChart(d.key, d, tooltip, colorScale);
      })
      .on("mousemove", (event) => {
        tooltip
        .style("left", `${event.pageX - 300 / 2}px`)
          .style("top", `${event.pageY}px`);
      })
      
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
        tooltip.selectAll("svg").remove();
      });

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height + 5})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"))) // Abbreviated month names
      .selectAll("text")
      .style("text-anchor", "middle");

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20},${20})`);

    keys.forEach((key, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0,${index * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(key));

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(key)
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle");
    });
  }

  drawMiniBarChart(modelKey, modelData, tooltip, colorScale) {
    // Clear previous bar chart
    tooltip.selectAll("svg").remove();
  
    // Dimensions for the mini bar chart
    const miniChartWidth = 300;
    const miniChartHeight = 200;
    const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  
    const width = miniChartWidth - margin.left - margin.right;
    const height = miniChartHeight - margin.top - margin.bottom;
  
    // Append an SVG to the tooltip
    const svg = tooltip
      .append("svg")
      .attr("width", miniChartWidth)
      .attr("height", miniChartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Extract data for the hovered model
    const barData = modelData.map(d => ({
      date: d.data.Date,
      value: d.data[modelKey]
    }));
  
    // Define scales
    const xScale = d3.scaleBand()
      .domain(barData.map(d => d.date))
      .range([0, width])
      .padding(0.1);
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(barData, d => d.value)])
      .nice()
      .range([height, 0]);
  
    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")))
      .selectAll("text")
      .style("font-size", "10px")
      .style("text-anchor", "middle");
  
    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .style("font-size", "10px");
  
    // Add bars
    svg.selectAll(".bar")
      .data(barData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.date))
      .attr("y", d => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.value))
      .attr("fill", colorScale(modelKey));
  }
  

  render() {
    return <div ref={this.chartRef}></div>;
  }
}

export default Child1;
