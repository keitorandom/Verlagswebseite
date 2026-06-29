# Hönscheidt Publishing Website

Statische, responsive Website für den unabhängigen Verlag **Hönscheidt Publishing**. Die öffentliche Website läuft weiterhin ohne eigenes Backend, ohne Framework, ohne Node.js und ohne Build-Schritt über GitHub Pages. Buchdaten werden zentral in `data/books.json` gepflegt und können zusätzlich über Decap CMS im geschützten Adminbereich bearbeitet werden.

## Projektstruktur

```text
/
  index.html                    # Startseite
  buecher.html                  # Bücherübersicht mit Leseproben
  autorinnen.html               # Manuskripteinreichung per JavaScript an Netlify Function
  admin/
    index.html                  # Decap-CMS-Adminbereich unter /admin/
    config.yml                  # CMS-Konfiguration für Netlify Identity + Git Gateway
  data/
    books.json                  # Zentrale Buchdaten
  impressum.html                # Impressum-Vorlage
  datenschutz.html              # Datenschutz-Vorlage
  404.html                      # Fehlerseite für GitHub Pages
  robots.txt                    # Hinweise für Suchmaschinen
  sitemap.xml                   # Sitemap mit den wichtigsten Seiten
  .nojekyll                     # Liefert Dateien in GitHub Pages unverändert aus
  assets/
    css/style.css               # Gestaltung, Systemschrift-Fallbacks und responsive Layouts
    fonts/                      # Optionaler Ablageort für spätere lokale WOFF2-Dateien
      README.md                 # Hinweise zur späteren lokalen Schrifteinbindung
    js/main.js                  # Mobile Navigation, Buch-Rendering und Formularversand
    images/
      README.md                 # Hinweise für spätere Bilder
      hoenscheidt-publishing-logo.png # Firmenlogo, später manuell hochladen
      uploads/.gitkeep          # Zielordner für CMS-Coveruploads
  netlify/functions/            # Netlify Function für Manuskripteinreichungen
  netlify.toml                   # Minimale Netlify-Konfiguration für Functions
  package.json                   # Dependencies für Netlify Functions
```

## Inhalte ändern

- Allgemeine Texte auf der Startseite bearbeiten Sie direkt in `index.html`.
- Buchdaten werden zentral in `data/books.json` gespeichert.
- Die Startseite zeigt im Bereich „Neueste Veröffentlichungen“ automatisch maximal drei Bücher, bei denen `featured` aktiviert ist.
- `buecher.html` zeigt automatisch alle Bücher aus `data/books.json` inklusive Leseprobe.
- Der Link „Mehr erfahren“ führt automatisch zur passenden Buchkarte und Leseprobe auf `buecher.html`, zum Beispiel `buecher.html#vers-versa-und-vision`.
- E-Mail-Adressen und rechtliche Angaben müssen in `index.html`, `impressum.html` und `datenschutz.html` angepasst werden.

## Decap CMS mit Netlify Identity und Git Gateway einrichten

1. Öffnen Sie Ihr mit dem GitHub-Repository verbundenes Projekt in Netlify und aktivieren Sie **Netlify Identity**.
2. Stellen Sie die Registrierung in den Identity-Einstellungen auf **Invite only**, damit sich nur eingeladene Personen anmelden können.
3. Aktivieren Sie in Netlify **Git Gateway**, damit Decap CMS Änderungen als Commits in den Branch `main` schreiben kann.
4. Öffnen Sie den Adminbereich unter `https://hoenscheidt-publishing.de/admin/` oder über die Netlify-Vorschau unter `/admin/`.
5. Melden Sie sich an und fügen Sie Bücher über die CMS-Maske hinzu oder bearbeiten Sie bestehende Einträge.

Hinweis: Nach dem Speichern im CMS erzeugt Git Gateway einen Commit im Repository. Die öffentliche Website wird erst sichtbar aktualisiert, nachdem GitHub Pages diesen neuen Commit veröffentlicht hat.


## Netlify Identity Callback

Einladungs-, Passwort-Reset-, E-Mail-Bestätigungs- und E-Mail-Änderungslinks von Netlify Identity werden automatisch über `auth-callback.html` verarbeitet. Falls ein Netlify-E-Mail-Link zunächst auf die Startseite zeigt, erkennt `index.html` die Identity-Tokens im URL-Hash und leitet inklusive unverändertem Hash an `/auth-callback.html` weiter.

Nach Änderungen an dieser Callback-Seite oder an der Weiterleitungslogik ist ein neuer Netlify-Deploy nötig, damit die Netlify-Domain `https://hoenscheidt-publishing-admin.netlify.app/` die aktuelle Version ausliefert.

## Schriftarten

Externe Google-Fonts-Links wurden aus den öffentlichen HTML- und CSS-Dateien entfernt. Die Website verwendet derzeit ausschließlich datenschutzfreundliche System-Fallbacks: Überschriften nutzen `Georgia`, `"Times New Roman"`, `serif`; Fließtext nutzt `Arial`, `Helvetica`, `sans-serif`.

Der Ordner `assets/fonts/` ist nur für eine spätere lokale Schrifteinbindung vorbereitet. Legen Sie dort nur echte, lizenzrechtlich geklärte `.woff2`-Dateien ab und ergänzen Sie danach passende `@font-face`-Regeln in `assets/css/style.css`. Es wurden bewusst keine Fontdateien erzeugt, heruntergeladen oder committet.

Der entsprechende Abschnitt in `datenschutz.html` beschreibt die systembasierten Schrift-Fallbacks und bleibt mit `[RECHTLICH PRÜFEN]` markiert.

## Firmenlogo und Manuskripteinreichungen

- Das Firmenlogo muss später manuell unter `assets/images/hoenscheidt-publishing-logo.png` hochgeladen werden. Der vorbereitete Logo-Bereich ist im Code mit `<!-- Hier muss das Logo rein -->` markiert; bis zum Upload bleibt der Header-Bereich als neutraler Platzhalter ohne sichtbaren Ersatztext frei.
- Die öffentliche Website bleibt GitHub Pages unter `https://hoenscheidt-publishing.de`. Die Domain soll nicht auf Netlify umziehen.
- Adminbereich, Decap CMS, Netlify Identity, Netlify Functions und Netlify Blobs laufen weiterhin im Hintergrund über das Netlify-Projekt `https://hoenscheidt-publishing-admin.netlify.app/`.
- Das Formular in `autorinnen.html` bleibt für Besucher auf `https://hoenscheidt-publishing.de/autorinnen.html` und sendet die Daten per JavaScript im Hintergrund an die Function `/.netlify/functions/manuskript-einreichung`. Es gibt keine Besucher-Weiterleitung auf eine `netlify.app`-Adresse.
- Einreichungen werden nicht in GitHub gespeichert. Manuskriptdateien werden im Netlify-Blob-Store `manuscript-files` mit zufälliger UUID gespeichert; Metadaten werden getrennt im Store `manuscript-metadata` abgelegt. Es wird keine öffentliche Download-URL erzeugt.
- Eingegangene Daten prüfen Sie im Netlify-Dashboard des Admin-Projekts unter **Blobs** beziehungsweise über geschützte interne Tools, nicht über GitHub und nicht über Netlify Forms.
- Das gespeicherte Löschdatum liegt 60 Tage nach der Einreichung. Der automatische Löschjob wird erst in einem nächsten PR ergänzt; bis dahin muss die Löschung organisatorisch beziehungsweise manuell kontrolliert werden.
- Fehler beim Formular erkennen Besucher am Statusbereich direkt unter dem Absende-Button. In Netlify prüfen Sie zusätzlich die Function-Logs, die bewusst keine personenbezogenen Daten ausgeben sollen.
- Die Texte zur Manuskripteinreichung und die Ergänzungen in `datenschutz.html` sind mit `[RECHTLICH PRÜFEN]` markiert und müssen vor Veröffentlichung rechtlich geprüft werden.

### Netlify-Deploy-Einstellungen für Functions

- Repository mit Netlify verbunden lassen; öffentliche Auslieferung bleibt dennoch GitHub Pages.
- Build command: `echo "Building Netlify Functions"`
- Publish directory: `.`
- Functions directory: `netlify/functions`
- Keine Secrets oder Zugangsdaten im Repository speichern.
- Nach dem Merge einen Netlify-Deploy auslösen, damit die Function und Dependencies (`@netlify/blobs`, `@netlify/functions`, `busboy`) installiert werden.
- Prüfen, dass die Function-URL `https://hoenscheidt-publishing-admin.netlify.app/.netlify/functions/manuskript-einreichung` erreichbar ist und CORS nur `https://hoenscheidt-publishing.de`, `https://www.hoenscheidt-publishing.de` sowie lokale Entwicklungs-Origins zulässt.
- Das einfache serverseitige Rate Limit erlaubt maximal 3 Einreichungen pro IP-Hash pro Stunde. Es speichert keine rohe IP-Adresse und ist nur eine grundlegende Anti-Spam-Maßnahme, kein vollständiger DDoS-Schutz.

### Formular testen

1. Öffnen Sie `https://hoenscheidt-publishing.de/autorinnen.html` und senden Sie ein Testmanuskript als PDF, DOC oder DOCX unter 8 MB ab. Die Adresse im Browser muss unverändert auf `hoenscheidt-publishing.de/autorinnen.html` bleiben.
2. Prüfen Sie, dass während der Übermittlung der Absende-Button deaktiviert ist und danach die Erfolgsmeldung direkt unter dem Button erscheint.
3. Testen Sie eine zu große oder falsche Datei und kontrollieren Sie, dass eine sachliche Fehlermeldung angezeigt wird.
4. Prüfen Sie im Netlify-Dashboard des Admin-Projekts die Stores `manuscript-files` und `manuscript-metadata`. Manuskripte dürfen nicht in GitHub und nicht über eine öffentliche Download-URL auftauchen.
5. Testen Sie bei Bedarf lokal mit Netlify Dev über einen erlaubten localhost-Origin.

## Buchcover und Bilder ändern

Coverbilder, die über Decap CMS hochgeladen werden, landen in `assets/images/uploads/`. Wenn ein Coverbild fehlt oder nicht geladen werden kann, zeigt die Website automatisch eine gestaltete Platzhalterfläche mit dem Buchtitel.

1. Laden Sie Coverbilder bevorzugt über den Adminbereich hoch.
2. Nutzen Sie kurze, aussagekräftige Dateinamen.
3. Hinterlegen Sie später ein Social-Sharing-Bild unter `assets/images/social-sharing-placeholder.jpg` oder passen Sie die Open-Graph-Metadaten in den HTML-Dateien an.

## GitHub Pages

GitHub Pages ist über den Branch `main` und das Root-Verzeichnis `/(root)` aktiviert. Die Website benötigt keinen Build-Schritt: GitHub veröffentlicht die statischen Dateien direkt aus dem Repository-Root.

## Eigene Domain bei STRATO verbinden

Die Domain `hoenscheidt-publishing.de` kann bei STRATO per DNS mit GitHub Pages verbunden werden. Folgen Sie dazu der aktuellen GitHub-Pages-Dokumentation für Apex-Domains und `www`-Subdomains und tragen Sie die erforderlichen DNS-Records im STRATO-Kundenbereich ein.

## Plausible Analytics

Der datensparsame Plausible-Tracking-Code ist direkt im `<head>`-Bereich aller HTML-Seiten im Repository-Root eingebunden (`index.html`, `impressum.html`, `datenschutz.html` und `404.html`). Die Einbindung verwendet das Script `https://plausible.io/js/pa-yvF1Fa0au-Iex7ikJMIqC.js` für die Domain `hoenscheidt-publishing.de`.

## Rechtlicher Hinweis

`impressum.html` und `datenschutz.html` enthalten bewusst markierte Platzhalter. Beide Seiten müssen vor Veröffentlichung vollständig ergänzt und rechtlich geprüft werden. Dies gilt insbesondere für Anbieterkennzeichnung, Verantwortliche, Kontaktangaben, Hosting-Angaben, systembasierte Schrift-Fallbacks, Netlify Functions, Netlify Blobs, Manuskripteinreichungen und mögliche spätere Funktionen wie Kontaktformular, Newsletter oder Tracking.

## Nächste Schritte

1. Netlify Identity und Git Gateway vollständig einrichten
2. Erste Bücher über `/admin/` pflegen
3. Impressum und Datenschutz rechtlich ergänzen
4. STRATO-DNS mit GitHub Pages verbinden
5. HTTPS in GitHub Pages prüfen oder aktivieren
