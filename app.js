(function () {
  "use strict";
  const cfg = window.APP_CONFIG;
  const form = document.getElementById("finder");
  const statusEl = document.getElementById("status");
  const laneEl = document.getElementById("lane");
  let lokaleDaten = null;

  formularAufbauen();
  zeigeLanes(cfg.TAETIGKEITEN.map(function (t) { return t.id; }), []);
  setzeStatus("Wählen Sie links Ihre Ausgangslage und zeigen Sie die passenden Use Cases an.");
  form.addEventListener("submit", beimAbsenden);

  function formularAufbauen() {
    const g = document.getElementById("taetigkeiten-optionen");
    cfg.TAETIGKEITEN.forEach(function (t) {
      g.insertAdjacentHTML("beforeend", '<label class="chip"><input type="checkbox" name="taetigkeit" value="' + esc(t.id) + '"><span>' + esc(t.name) + "</span></label>");
    });
    const a = document.getElementById("aufgaben-optionen");
    cfg.KI_AUFGABEN.forEach(function (x) {
      a.insertAdjacentHTML("beforeend", '<label class="chip"><input type="checkbox" name="genutzt" value="' + esc(x) + '"><span>' + esc(x) + "</span></label>");
    });
  }

  async function beimAbsenden(event) {
    event.preventDefault();
    const d = new FormData(form);
    const gewaehlt = d.getAll("taetigkeit");
    const auswahl = { genutzt: d.getAll("genutzt"), taetigkeiten: gewaehlt.length ? gewaehlt : cfg.TAETIGKEITEN.map(function (t) { return t.id; }) };
    setzeStatus("Use Cases werden geladen …");
    try {
      const treffer = await ladeUseCases(auswahl);
      zeigeLanes(auswahl.taetigkeiten, treffer);
      setzeStatus(treffer.length === 0
        ? "Für diese Auswahl gibt es keine weiteren Vorschläge. Wählen Sie weniger bereits genutzte KI-Aufgaben."
        : treffer.length + (treffer.length === 1 ? " Vorschlag passt" : " Vorschläge passen") + " zu Ihrer Auswahl.");
    } catch (err) {
      console.error(err);
      laneEl.innerHTML = "";
      setzeStatus(cfg.API_URL
        ? "Die Use Cases konnten nicht geladen werden. Prüfen Sie API_URL in config.js und die CORS-Einstellung im API Gateway."
        : "data.json konnte nicht geladen werden. Öffnen Sie die Seite über einen lokalen Webserver statt per Doppelklick (siehe README).", true);
    }
  }

  async function ladeUseCases(auswahl) {
    if (cfg.API_URL) {
      const p = new URLSearchParams({ taetigkeiten: auswahl.taetigkeiten.join(","), genutzt: auswahl.genutzt.join(",") });
      const r = await fetch(cfg.API_URL.replace(/\/$/, "") + "/usecases?" + p.toString());
      if (!r.ok) throw new Error("API antwortet mit Status " + r.status);
      return r.json();
    }
    if (!lokaleDaten) {
      const r = await fetch("data.json");
      if (!r.ok) throw new Error("data.json nicht gefunden");
      lokaleDaten = await r.json();
    }
    return filterUseCases(lokaleDaten, auswahl);
  }

  // Muss identisch zu filterUseCases in backend/lambda/index.mjs bleiben
  function filterUseCases(items, auswahl) {
    return items.filter(function (u) {
      return auswahl.taetigkeiten.indexOf(u.taetigkeit) !== -1 && auswahl.genutzt.indexOf(u.kiAufgabe) === -1;
    });
  }

  function zeigeLanes(ids, treffer) {
    laneEl.innerHTML = "";
    const section = document.createElement("section");
    section.className = "prozess";
    section.innerHTML = '<ol class="schritte"></ol>';
    const liste = section.querySelector(".schritte");
    let idx = 0;
    cfg.TAETIGKEITEN.filter(function (t) { return ids.indexOf(t.id) !== -1; }).forEach(function (t) {
      const imSchritt = treffer.filter(function (u) { return u.taetigkeit === t.id; });
      const li = document.createElement("li");
      li.className = "schritt" + (imSchritt.length ? " schritt--treffer" : "");
      if (imSchritt.length) li.style.setProperty("--i", idx++);
      const anzahl = imSchritt.length ? imSchritt.length + (imSchritt.length === 1 ? " Vorschlag" : " Vorschläge") : "";
      li.innerHTML =
        '<div class="schritt-kopf"><span class="schritt-knoten" aria-hidden="true"></span>' +
        '<h4 class="schritt-name">' + esc(t.name) + "</h4>" +
        '<span class="schritt-anzahl">' + anzahl + "</span></div>" +
        '<ul class="usecases">' + imSchritt.map(useCaseHtml).join("") + "</ul>";
      liste.appendChild(li);
    });
    laneEl.appendChild(section);
    const bekannt = cfg.TAETIGKEITEN.map(function (t) { return t.id; });
    const unbekannt = treffer.filter(function (u) { return bekannt.indexOf(u.taetigkeit) === -1; });
    if (unbekannt.length) console.warn("Use Cases mit unbekannter Tätigkeit (in config.js ergänzen):", unbekannt.map(function (u) { return u.id; }));
  }

  function useCaseHtml(u) {
    return '<li class="usecase"><div class="usecase-kopf"><p class="usecase-titel">' + esc(u.titel) + '</p><span class="usecase-aufgabe">' + esc(u.kiAufgabe) + "</span></div>" +
      '<dl class="usecase-fakten"><dt>So geht es</dt><dd>' + esc(u.beschreibung) + "</dd><dt>Tool</dt><dd>" + esc(u.tool) + "</dd><dt>Mehrwert</dt><dd>" + esc(u.mehrwert) + "</dd></dl>" +
      '<details><summary>Beleg (Quelle)</summary><p class="usecase-quelle">' + esc(u.quelle) + "</p></details></li>";
  }

  function setzeStatus(text, fehler) { statusEl.textContent = text; statusEl.classList.toggle("status--fehler", Boolean(fehler)); }
  function esc(w) { return String(w == null ? "" : w).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
})();
