document.addEventListener("DOMContentLoaded", function () {
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  const API_URL = "https://open.er-api.com/v6/latest/USD";
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      const currencies = Object.keys(data.rates);
      currencies.forEach((currency) => {
        const fromOption = document.createElement("option");
        const toOption = document.createElement("option");
        fromOption.value = currency;
        fromOption.textContent = currency;
        toOption.value = currency;
        toOption.textContent = currency;
        from.append(fromOption);
        to.append(toOption);
      });
      from.value = "USD";
      to.value = "INR";
    });
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const fromCurrency = from.value;
    const toCurrency = to.value;
    const amount = parseFloat(document.getElementById("amount").value);
    fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
      .then((response) => response.json())
      .then((data) => {
        const currencyrate = data.rates[toCurrency];
        const totalprice = (amount * currencyrate).toFixed(2);
        findBestArbitragePaths(
          data.rates,
          fromCurrency,
          toCurrency,
          amount,
          totalprice
        );
      });
  });

  function findBestArbitragePaths(
    rates,
    fromCurrency,
    toCurrency,
    amount,
    totalprice
  ) {
    const intermediates = Object.keys(rates).filter(
      (currency) => currency !== fromCurrency && currency !== toCurrency
    );

    const results = [];
    intermediates.forEach((intermediate) => {
      const rate1 = rates[intermediate];
      const rate2 = null;

      fetch(`https://open.er-api.com/v6/latest/${intermediate}`)
        .then((response) => response.json())
        .then((data) => {
          const rate2 = data.rates[toCurrency];

          if (rate1 && rate2) {
            const altamount = (amount * rate1 * rate2).toFixed(2);
            results.push({
              path: `${fromCurrency} → ${intermediate} → ${toCurrency}`,
              amount: altamount,
            });
          }

          if (results.length === intermediates.length) {
            displayBestPaths(results, totalprice);
          }
        });
    });
  }

  function displayBestPaths(results, totalprice) {
    results.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    const bestways = results.slice(0, 3);

    let finalresult = `<p>On conversion amount is: ${totalprice}</p>`;
    finalresult += `<h3>Best alternative ways:</h3>`;
    bestways.forEach((path, index) => {
      finalresult += `<p>${index + 1}. ${path.path} = ${path.amount}</p><br>`;
    });
    finalresult += `<h4> Thank you for using this Website </h4>`;

    document.getElementById("result").innerHTML = finalresult;
  }
});
