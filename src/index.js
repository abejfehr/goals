import {
  cloneDate,
  findPaymentAmountByGoalDate,
  FREQUENCY
} from "./savings-service";
import { renderGraph } from "./graph-renderer";

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

    // Append yesterday to the payments
    const firstDate = payments[0].date;
    const lastDate = payments[payments.length - 1].date;
    const weekBefore = cloneDate(firstDate);
    const weekAfter = cloneDate(lastDate);
    weekBefore.setDate(firstDate.getDate() - 7);
    weekAfter.setDate(lastDate.getDate() + 7);

    // Render the graph
    const newPayments = [
      ...payments,
      {
        date: weekAfter,
        payment: 0,
        value: payments[payments.length - 1].value
      }
    ];

    const getReadableDate = date => {
      const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      return `${
        MONTHS[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`;
    };

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

    const isToday = date => {
      const today = new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
      );
    };

    const onScrub = dataPoint => {
      const output = document.querySelector("output");
      output.classList.remove("is-error");
      if (dataPoint.value === goalAmount) {
        output.innerHTML = `You'll reach your goal if you put away $${dataPoint.payment.toFixed(
          2
        )} every ${getReadableFrequency(frequency)}!`;
      } else if (isToday(dataPoint.date)) {
        output.innerHTML = `To start off, put away $${dataPoint.payment.toFixed(
          2
        )} today!`;
      } else {
        output.innerHTML = `You'll have $${dataPoint.value.toFixed(
          2
        )} by ${getReadableDate(dataPoint.date)}.`;
      }
    };
    renderGraph(newPayments, onScrub);
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
