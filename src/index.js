import {
  cloneDate,
  findPaymentAmountByGoalDate,
  FREQUENCY
} from "./savings-service";
import * as d3 from "d3";

const renderGraph = data => {
  const container = document.querySelector("#chart");

  var margin = { top: 10, right: 30, bottom: 30, left: 50 };
  var width =
    container.getBoundingClientRect().width - margin.left - margin.right;
  var height =
    container.getBoundingClientRect().height - margin.top - margin.bottom;

  var svg = d3.select("#chart > svg");

  svg.selectAll("*").remove();

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

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

const readInputsAndRenderGraph = () => {
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

  try {
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

    const output = document.querySelector("output");
    output.classList.remove("is-error");
    output.innerHTML = `You'll reach your goal if you put away $${payments[0].payment.toFixed(
      2
    )} every ${getReadableFrequency(frequency)}!`;
  } catch (error) {
    const output = document.querySelector("output");
    output.classList.add("is-error");
    output.innerHTML = error;
  }
};

elements.forEach(element => {
  element.addEventListener("input", readInputsAndRenderGraph);
});
readInputsAndRenderGraph();
