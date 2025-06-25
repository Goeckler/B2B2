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
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${kunde.kundennummer} – ${kunde.name}`;
    dropdown.appendChild(opt);
  });

  const neuePreise = ["TK Stufe 1", "TK Stufe 2", "TK Stufe 3", "TK Stufe 4", "TK Stufe 5", "TK Stufe 6"];
  const npSelect = document.getElementById("preisliste-neu");
  npSelect.innerHTML = '<option selected disabled>-- bitte wählen --</option>';
  neuePreise.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    npSelect.appendChild(opt);
  });

  const verkaufschanceContainer = document.getElementById("verkaufschance-container");
  verkaufschanceContainer.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const sel = document.createElement("select");
    sel.name = `verkaufschance_${i}`;
    artikel.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a.artikelnummer;
      opt.textContent = a.artikelbezeichnung;
      sel.appendChild(opt);
    });
    verkaufschanceContainer.appendChild(sel);
  }

  dropdown.addEventListener("change", () => updateCustomerView());
  npSelect.addEventListener("change", () => updateCustomerView());
}


function updateCustomerView(kundenListe, preise, preisnamen) {
  const index = document.getElementById("customer-select").value;
  if (!index) return;

  const kunde = kundenListe[index];
  document.getElementById("preisliste-aktuell").value = preisnamen[kunde.preisliste] || kunde.preisliste;

  const topContainer = document.getElementById("top-article-container");
  topContainer.innerHTML = "";
  kunde.top10.slice(0, 5).forEach((art, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${art.artikelbezeichnung} (${art.absatz} Stück)`;
    topContainer.appendChild(div);
  });

  const neue = document.getElementById("preisliste-neu").value;
  const vergleich = document.getElementById("preisvergleich");
  vergleich.innerHTML = "";

  if (neue && preise && kunde.top10.length) {
    let sumAlt = 0;
    let sumNeu = 0;

    kunde.top10.forEach((art) => {
      const alt = preise[art.artikelnummer]?.alt?.[kunde.preisliste];
      const neu = preise[art.artikelnummer]?.neu?.[neue];
      if (alt && neu) {
        const altGes = alt * art.absatz;
        const neuGes = neu * art.absatz;
        sumAlt += altGes;
        sumNeu += neuGes;

        const diff = neuGes - altGes;
        const p = document.createElement("p");
        p.innerHTML = `${art.artikelbezeichnung}: alt ${altGes.toFixed(2)} €, neu ${neuGes.toFixed(2)} €, Differenz: <b style="color:${diff > 0 ? 'red' : 'green'}">${diff.toFixed(2)} €</b>`;
        vergleich.appendChild(p);
      }
    });

    const totalDiff = sumNeu - sumAlt;
    const diffPercent = ((totalDiff / sumAlt) * 100).toFixed(1);
    const totalP = document.createElement("p");
    totalP.innerHTML = `<hr><b>Gesamt alt:</b> ${sumAlt.toFixed(2)} €<br>
<b>Gesamt neu:</b> ${sumNeu.toFixed(2)} €<br>
<b>Veränderung:</b> <span style="color:${totalDiff > 0 ? 'red' : 'green'}">${totalDiff.toFixed(2)} € (${diffPercent} %)</span>`;
    vergleich.appendChild(totalP);
  }
}


function saveDraft() {
  alert("Entwurf gespeichert (Demo).");
}

function submitForm() {
  alert("Formular abgeschickt (Demo).");
}

function nextCustomer() {
  document.getElementById("customer-select").selectedIndex = 0;
  document.getElementById("preisliste-aktuell").value = "";
  document.getElementById("preisliste-neu").selectedIndex = 0;
  document.getElementById("top-article-container").innerHTML = "";
  document.getElementById("verkaufschance-container").querySelectorAll("select").forEach(sel => sel.selectedIndex = 0);
  document.getElementById("kommentar").value = "";
  document.getElementById("preisvergleich").innerHTML = "";
}

function removeCustomer() {
  const index = document.getElementById("customer-select").value;
  if (!index) return;
  kundenListe.splice(index, 1);
  document.getElementById("customer-select").remove(index);
  nextCustomer();
}