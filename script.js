const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const FALLBACK_URL = "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurrency = document.querySelector(".from select");
const toCurrency = document.querySelector(".to select");
const msg = document.querySelector(".message");
const amountInput = document.querySelector(".ammount input");

let latestRequest = 0;

// Populate currency dropdowns
for (let select of dropdowns) {
  for (let currencyCode in countryList) {
    let newOption = document.createElement("option");

    newOption.innerText = currencyCode;
    newOption.value = currencyCode;

    if (select.name === "from" && currencyCode === "USD") {
      newOption.selected = true;
    } else if (select.name === "to" && currencyCode === "PKR") {
      newOption.selected = true;
    }

    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
    updateExchangeRate();
  });
}

// Update country flags
const updateFlag = (element) => {
  let currencyCode = element.value;
  let countryCode = countryList[currencyCode];

  let newSrc = `https://flagsapi.com/${countryCode}/shiny/64.png`;

  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

// Fetch exchange rates with fallback
const fetchRates = async (from) => {
  let URL = `${BASE_URL}/${from.toLowerCase()}.json`;

  try {
    let response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Primary API failed");
    }

    return await response.json();
  } catch (error) {
    console.warn("Primary API failed. Trying fallback API...");

    let fallbackResponse = await fetch(
      `${FALLBACK_URL}/${from.toLowerCase()}.json`,
    );

    if (!fallbackResponse.ok) {
      throw new Error("Both currency APIs failed");
    }

    return await fallbackResponse.json();
  }
};

// Get and display exchange rate

const updateExchangeRate = async (convertAmount = false) => {
  const requestId = ++latestRequest;

  let amount = Number(amountInput.value);

  if (isNaN(amount) || amount < 1) {
    amount = 1;
  }

  let from = fromCurrency.value;
  let to = toCurrency.value;

  msg.innerText = "Fetching exchange rate...";

  try {
    let data = await fetchRates(from);

    if (requestId !== latestRequest) return;

    let rate = data[from.toLowerCase()][to.toLowerCase()];

    if (!rate) {
      throw new Error("Exchange rate not available");
    }

    if (convertAmount) {
      let finalAmount = amount * rate;

      msg.innerText = `${amount} ${from} = ${Number(finalAmount.toFixed(4)).toLocaleString("en-US")} ${to}`;
    } else {
      msg.innerText = `1 ${from} = ${Number(rate.toFixed(6)).toLocaleString("en-US")} ${to}`;
    }
  } catch (error) {
    if (requestId !== latestRequest) return;

    console.error("Currency conversion error:", error);
    msg.innerText = "Unable to fetch exchange rate. Please try again.";
  }
};

// Get Exchange Rate button
btn.addEventListener("click", (evt) => {
  evt.preventDefault();

  if (amountInput.value === "" || Number(amountInput.value) < 1) {
    amountInput.value = "1";
  }

  updateExchangeRate(true);
});

// Initial exchange rate on page load
updateExchangeRate();
