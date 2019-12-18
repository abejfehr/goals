import {
  cloneDate,
  findPaymentAmountByGoalDate,
  FREQUENCY
} from "./savings-service";
import * as d3 from "d3";

const renderGraph = data => {
  var margin = { top: 10, right: 30, bottom: 30, left: 50 };
  var width = 460 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  console.log("appendinga path 5");

  var svg = d3.select("#chart > svg");

  svg.selectAll("*").remove();

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  console.log("appendinga path 1");
  var x = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function(d) {
        return +d.value;
      })
    ])
    .range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  console.log("appendinga path mo");
  svg
    .append("path")
    .datum(data)
    .attr("fill", "#cce5df")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
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
};

const elements = document.querySelectorAll(
  "input[name=goalAmount],input[name=goalDate],input[name=principal],select[name=frequency]"
);

elements.forEach(element => {
  element.addEventListener("input", e => {
    e.preventDefault();

    // Get the values
    const goalAmount = Number(
      document.querySelector("input[name=goalAmount]").value
    );
    const goalDate = new Date(
      document.querySelector("input[name=goalDate]").value
    );
    const principal = Number(
      document.querySelector("input[name=principal]").value
    );
    const frequency = document.querySelector("select[name=frequency]").value;

    const payments = findPaymentAmountByGoalDate({
      goalDate,
      goalAmount,
      frequency,
      principal
    });

    // Render the graph
    renderGraph(payments);

    const getReadableFrequency = f => {
      switch (f) {
        case "MONTHLY":
          return "month";
        case "WEEKLY":
          return "week";
        case "BIWEEKLY":
          return "2 weeks";
      }
    };

    document.querySelector(
      "output"
    ).innerHTML = `You would need to put away $${payments[0].payment.toFixed(
      2
    )} every ${getReadableFrequency(frequency)}`;
  });
});
