"use strict";
const main = async () => {

// Toggle Portfolio on Details button
let details = document.querySelector('#details').addEventListener('click', showDetails);
function showDetails(event) {
    document.querySelector('#portfolio').classList.toggle('hidden');
}

// Crypto APIs
const addresses = {
    BTC: "bc1q68m4mr5k0suqcdkekvf5uuee9gqrec26cn6f2q",
    ETH: "0x1002C951904AD6ABB84f40ef93c1579E7510520C",
    DOGE: "D8miuJKjGu53ots9TdB678DXubELborT9p",
};

const multiplier = {
    BTC: 1e8,
    ETH: 1e18,
    DOGE: 1e8,
}

const fetchPrice = async (currency) => {
    // https://github.com/fawazahmed0/currency-api
    // Free, no rate limiting. Downside: updated only once a day.
    currency = currency.toLowerCase();
    const targetCurrency = "CHF".toLowerCase();
    const r = await fetch(
        "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/"
        + currency + "/" + targetCurrency + ".json"
    );
    if (!r.ok) {
        console.error("fetch failed", r);
        throw new Error("fetch failed");
    }
    const data = await r.json();
    console.log(currency, data);
    return data[targetCurrency];
};

const fetchAddressBalance = async (chain, address) => {
    // https://insight.is/
    // Used by https://bitpay.com/insight/#/ALL/mainnet/home

    const api = chain == "ETH" ? "api-eth" : "api";
    const r = await fetch(`https://${api}.bitcore.io/api/${chain}/mainnet/address/${address}/balance`);
    const data = await r.json();
    console.log("response", data);
    return data.balance / multiplier[chain];
};

const collectAll = async () => {
    const results = [];
    let total = 0;
    for (const [chain, address] of Object.entries(addresses)) {
        const balance = await fetchAddressBalance(chain, address);
        const price = await fetchPrice(chain);
        const value = price * balance;
        total += value;
        results.push({
            Crypto: chain,
            Address: address,
            Balance: balance,
            PriceCHF: price,
            ValueCHF: value,
        });
    }
    console.table(results);
    console.log("Total CHF", total);
    return results;
};

// Fill Tables

let valueTable = document.getElementById('valueTable');
let portfolioTable = document.getElementById('portfolioTable');
let total = 0;
let results = await collectAll();
console.log(results);

for (let i = 0; i < results.length; i++) {
    total += results[i]['ValueCHF'];
    valueTable.innerHTML += `
    <tr>
        <td>${i+1}</td>
        <td>${results[i]['Crypto']}</td>
        <td>${results[i]['ValueCHF'].toFixed(2)}</td>
    </tr>`;
    portfolioTable.innerHTML += `
    <tr>
        <td>${i+1}</td>
        <td>${results[i]['Crypto']}</td>
        <td>${results[i]['Address']}</td>
        <td>${results[i]['Balance']}</td>
        <td>${results[i]['PriceCHF']}</td>
        <td>${results[i]['ValueCHF']}</td>
    </tr>`;
};
valueTable.innerHTML += `
    <tr>
        <td>Total</td>
        <td></td>
        <td><strong>${total.toFixed(2)}</strong></td>
    </tr>`;
}
main();
