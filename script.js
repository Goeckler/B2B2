let users = {
  "bahre": "Start123!",
  "diederichsen": "Start123!",
  "wunder": "Start123!",
  "ostkamp": "Start123!",
  "unglaube": "Start123!",
  "großkemm": "Start123!",
  "test": "Start123!"
};

let currentUser = null;
let kundenListe = [];
let artikel = [];
let preise = {};
let preisnamen = {};

async function login() {
  const username = document.getElementById("username").value.toLowerCase();
  const password = document.getElementById("password").value;

  if (users[username] === password) {
    currentUser = username;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("form-container").style.display = "block";
    loadData();
  } else {
    document.getElementById("login-error").textContent = "Falscher Login.";
  }
}

async function loadData() {
  const kundenRaw = await fetch("kunden.json").then(res => res.json());
  artikel = await fetch("artikel.json").then(res => res.json());
  preise = await fetch("preise_vergleich.json").then(res => res.json());
  preisnamen = await fetch("preislisten_namen.json").then(res => res.json());

  kundenListe = kundenRaw[currentUser] || [];

  const dropdown = document.getElementById("customer-select");
  dropdown.innerHTML = '<option selected disabled>-- bitte wählen --</option>';

  kundenListe.forEach((kunde, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${kunde.kundennr} ${kunde.name}`;
    option.className = kunde.status === "abgeschlossen" ? "green-dot" : "red-dot";
    dropdown.appendChild(option);
  });

  const preislisteDropdown = document.getElementById("preisliste-neu");
  preislisteDropdown.innerHTML = '<option selected disabled>-- bitte wählen --</option>';
  for (let i = 1; i <= 6; i++) {
    let opt = document.createElement("option");
    opt.value = `TK${i}`;
    opt.textContent = `TK Stufe ${i}`;
    preislisteDropdown.appendChild(opt);
  }
}

function displayCustomer(index) {
  const kunde = kundenListe[index];
  document.getElementById("preisliste-aktuell").value = preisnamen[kunde.aktuelle_preisliste] || kunde.aktuelle_preisliste;

  const topContainer = document.getElementById("top-article-container");
  topContainer.innerHTML = "";
  kunde.top_artikel.forEach((a, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${a.name} (${a.absatz} Stück)`;
    topContainer.appendChild(div);
  });

  const vcContainer = document.getElementById("verkaufschance-container");
  vcContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const select = document.createElement("select");
    let defaultOpt = document.createElement("option");
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- bitte wählen --";
    select.appendChild(defaultOpt);
    artikel.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a.name;
      opt.textContent = a.name;
      select.appendChild(opt);
    });
    vcContainer.appendChild(select);
  }

  document.getElementById("kommentar").value = kunde.kommentar || "";
  showUmsatzvergleich(kunde);
}

function removeCustomer() {
  const dropdown = document.getElementById("customer-select");
  const index = dropdown.value;
  if (index !== null) {
    kundenListe.splice(index, 1);
    dropdown.remove(index);
    document.getElementById("form-fields").reset?.();
  }
}

function nextCustomer() {
  document.getElementById("customer-select").selectedIndex = 0;
  document.getElementById("form-fields").reset?.();
}

function saveDraft() {
  alert("Zwischenspeicherung erfolgt lokal (Demo).");
}

function submitForm() {
  alert("Formular wurde abgeschickt (Demo).");
}

function showUmsatzvergleich(kunde) {
  const vergleichDiv = document.getElementById("preisvergleich");
  vergleichDiv.innerHTML = "";

  let altSumme = 0, neuSumme = 0;

  kunde.top_artikel.forEach(a => {
    const name = a.name;
    const absatz = a.absatz || 0;
    const altPreis = preise.alt[name] || 0;
    const neuPreis = preise.neu[name] || 0;
    const altUmsatz = altPreis * absatz;
    const neuUmsatz = neuPreis * absatz;
    altSumme += altUmsatz;
    neuSumme += neuUmsatz;
    const diff = neuUmsatz - altUmsatz;
    const diffStr = `${diff.toFixed(2)} €`;
    const color = diff > 0 ? "red" : (diff < 0 ? "green" : "black");

    vergleichDiv.innerHTML += `<p><b>${name}</b>: alt ${altUmsatz.toFixed(2)} € → neu ${neuUmsatz.toFixed(2)} € 
      <span style="color:${color}">(${diffStr})</span></p>`;
  });

  const diffSumme = neuSumme - altSumme;
  const diffPct = altSumme ? (diffSumme / altSumme * 100).toFixed(1) : "0.0";

  vergleichDiv.innerHTML += `<hr><p><b>Gesamt:</b> alt ${altSumme.toFixed(2)} € → neu ${neuSumme.toFixed(2)} € 
    <span style="color:${diffSumme >= 0 ? 'red' : 'green'}">(${diffSumme.toFixed(2)} €, ${diffPct} %)</span></p>`;
}