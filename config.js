// Zentrale Konfiguration der Web-App.
window.APP_CONFIG = {
  // Leer lassen: Die App liest lokal aus data.json. Mit AWS: Invoke-URL des API Gateway eintragen.
  API_URL: "",

  // Tätigkeiten. Die id muss in data.json bei "taetigkeit" stehen.
  TAETIGKEITEN: [
    { id: "workshop", name: "Workshop" },
    { id: "email", name: "E-Mail und Kundenkommunikation" },
    { id: "folien", name: "Folien und Präsentationen" },
    { id: "doku", name: "Dokumentation" },
    { id: "requirements engineering", name: "Requirements Engineering" },
    { id: "testing", name: "Testing" },
    { id: "schulung", name: "Schulung" },
    { id: "konfiguration", name: "Konfiguration und Customizing" },
    { id: "recherche", name: "Recherche" },
    { id: "loesungssuche", name: "Lösungssuche" }
  ],

  KI_AUFGABEN: ["Informationsextraktion","Textgenerierung","Zusammenfassung","Klassifikation","Prognose","Dialogassistenz"]
};
