import * as d3 from "d3";
import { scaleDiverging } from "d3";

export const renderGraph = (data, onScrub) => {
  const container = document.querySelector("#chart");

  var margin = { top: 0, right: 0, bottom: 0, left: 0 };
  var width =
    container.getBoundingClientRect().width - margin.left - margin.right;
  var height =
    container.getBoundingClientRect().height - margin.top - margin.bottom;

  var svg = d3.select("#chart > svg");

  svg.selectAll("*").remove();

  // Not sure what this is doing tbh
  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var x = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  // svg
  //   .append("g")
  //   .attr("transform", `translate(${margin.left}, ${height})`)
  //   .call(d3.axisBottom(x));

  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function(d) {
        return +d.value;
      })
    ])
    .range([height, 0]);

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#3c89e8")
    .attr("stroke-width", 2.5)
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr(
      "d",
      d3
        .line()
        .curve(d3.curveStepAfter)
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.value);
        })
    );

  svg
    .append("path")
    .datum(data)
    .attr("fill", "#e6f1ff")
    .attr("stroke", "none")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr(
      "d",
      d3
        .area()
        .curve(d3.curveStepAfter)
        .x(function(d) {
          return x(d.date);
        })
        .y0(y(0))
        .y1(function(d) {
          return y(d.value);
        })
    );

  const scrubber = svg
    .append("line")
    .attr("stroke", "#3c89e8")
    .attr("stroke-width", 2.5)
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", 0);

  const updateScrubber = (xCoord = null) => {
    const max = d3.max(data, d => d.value);
    const date = xCoord ? x.invert(xCoord) : data[data.length - 2].date; // Last datapoint (goal date)

    // const closestDataPoint = data.reduce((previous, current, index) => {
    //   if (current.date >= date && current.date <= previous.date) {
    //     return current;
    //   }
    //   return previous;
    //   // if (current.date <= date && (!previous || previous.date > current.date)) {
    //   //   return current;
    //   // }
    //   // return previous;
    // }, data[data.length - 2]);
    // console.log(date, closestDataPoint);

    const closestDataPoint = data.reduce((previous, current, index) => {
      // Cannot be the last data point
      if (index === data.length - 1) {
        return previous;
      }
      if (Math.abs(previous.date - date) < Math.abs(current.date - date)) {
        return previous;
      }
      return current;
    }, data[data.length - 2]);

    scrubber
      // .transition()
      // .duration(40)
      // .ease(d3.easeQuadInOut)
      .attr("y1", height)
      .attr("y2", y(closestDataPoint.value))
      .attr("x1", x(closestDataPoint.date))
      .attr("x2", x(closestDataPoint.date));

    onScrub(closestDataPoint);
  };

  svg
    .on("touchmove", function() {
      const [xCoord] = d3.touches(this)[0];
      updateScrubber(xCoord);
    })
    .on("mousemove", function() {
      const [xCoord] = d3.mouse(this);
      updateScrubber(xCoord);
    })
    .on("mouseleave", function() {
      // Return the scrubber to the goal amount
      updateScrubber();
    });

  updateScrubber();
};
