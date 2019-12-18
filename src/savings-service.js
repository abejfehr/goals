const dateDiff = (d1, d2) => {
  const timeDiff = d2.getTime() - d1.getTime();
  return Math.round(timeDiff / (1000 * 3600 * 24));
};

export const cloneDate = date => new Date(date.getTime());

const MONTHS_WITHOUT_31_DAYS = [1, 3, 5, 8, 10];

export const FREQUENCY = {
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  MONTHLY: "MONTHLY"
};

export const findPaymentAmountByGoalDate = ({
  goalDate,
  goalAmount,
  frequency,
  principal
}) => {
  let balance = principal;
  const periods = [];
  let today = new Date();
  // TODO: Change amount being incremented by depending on frequency
  for (let d = new Date(); d <= goalDate; d.setDate(d.getDate() + 1)) {
    // Is d the same day as today?
    let f = false;
    if (frequency === FREQUENCY.MONTHLY) {
      if (d.getDate() === today.getDate()) {
        periods.push(cloneDate(d));
        f = true;
      }
      // TODO: Handle 31st of months
    } else if (frequency === FREQUENCY.BIWEEKLY) {
      if (dateDiff(today, d) % 14 === 0) {
        periods.push(cloneDate(d));
        f = true;
      }
    } else if (frequency === FREQUENCY.WEEKLY) {
      if (dateDiff(today, d) % 7 === 0) {
        periods.push(cloneDate(d));
        f = true;
      }
    }
  }

  // TODO: Round up the payment amount

  // Now we know all the periods between now and the goal date
  return periods.map((date, index) => ({
    date,
    payment: (goalAmount - principal) / periods.length,
    value: principal + ((index + 1) * (goalAmount - principal)) / periods.length
  }));
};
