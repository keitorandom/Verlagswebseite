# Hönscheidt Publishing Website

Statische Website für **Hönscheidt Publishing**. Der Quellcode, die Inhalte und die Versionierung liegen im GitHub-Repository. Die öffentliche Website wird über GitHub Pages unter `https://hoenscheidt-publishing.de` ausgeliefert.

Netlify wird ergänzend für den geschützten CMS- und Funktionsbetrieb genutzt, nicht als öffentliche Hauptauslieferung der Website.

## Architektur

- **GitHub Repository**: Enthält Code, Inhalte, Buchdaten und Versionshistorie.
- **GitHub Pages**: Liefert die öffentliche Website unter `https://hoenscheidt-publishing.de` aus.
- **Netlify**: Wird nur für Decap CMS, Netlify Identity, Git Gateway, Netlify Functions und Netlify Blobs für Manuskripteinreichungen verwendet.
- **STRATO**: Verwaltet Domain und DNS für `hoenscheidt-publishing.de`.
- **Plausible**: Besucherstatistik ist im aktuellen Code weiterhin eingebunden.

## Projektstruktur

```text
/
  index.html                    # Startseite
  buecher.html                  # Bücherübersicht mit Leseproben
  autorinnen.html               # Formularseite für Manuskripteinreichungen
  admin/
    index.html                  # Decap-CMS-Adminoberfläche für die Netlify-Admin-Domain
    config.yml                  # CMS-Konfiguration für Netlify Identity und Git Gateway
  data/
    books.json                  # Zentrale Buchdaten
  impressum.html                # Impressum
  datenschutz.html              # Datenschutzseite
  404.html                      # Fehlerseite für GitHub Pages
  robots.txt                    # Hinweise für Suchmaschinen
  sitemap.xml                   # Sitemap
  .nojekyll                     # Liefert Dateien in GitHub Pages unverändert aus
  assets/
    css/style.css               # Gestaltung und responsive Layouts
    fonts/README.md             # Hinweise für mögliche spätere lokale Webfonts
    js/main.js                  # Navigation, Buch-Rendering und Formularversand
    images/                     # Bilder und CMS-Uploads
  netlify/functions/
    manuskript-einreichung.mjs              # Formularannahme und Blob-Speicherung
    loesche-abgelaufene-manuskripte.mjs     # Tägliche Löschfunktion
  netlify.toml                   # Netlify-Konfiguration für Checks und Functions
  package.json                   # Scripts und Dependencies für Netlify Functions
```

## Inhalte ändern

- Allgemeine Texte auf der Startseite werden direkt in `index.html` bearbeitet.
- Buchdaten werden zentral in `data/books.json` gespeichert.
- Die Startseite zeigt im Bereich „Neueste Veröffentlichungen“ automatisch maximal drei Bücher, bei denen `featured` aktiviert ist.
- `buecher.html` zeigt die Bücher aus `data/books.json` inklusive Leseproben.
- Der Link „Mehr erfahren“ führt zur passenden Buchkarte auf `buecher.html`, zum Beispiel `buecher.html#vers-versa-und-vision`.
- Rechtliche Angaben müssen in `impressum.html` und `datenschutz.html` gepflegt und geprüft werden.

## Adminbereich und CMS

Der funktionierende Adminbereich ist ausschließlich:

`https://hoenscheidt-publishing-admin.netlify.app/admin/`

`https://hoenscheidt-publishing.de/admin/` ist nicht der maßgebliche Netlify-Adminbereich. Die öffentliche Domain läuft über GitHub Pages. Deshalb erfolgt der CMS-Login über die Netlify-Adresse des Admin-Projekts.

Für den Betrieb des Adminbereichs werden im Netlify-Projekt benötigt:

1. **Netlify Identity** für den Login.
2. Registrierung auf **Invite only**, damit nur eingeladene Personen Zugriff erhalten.
3. **Git Gateway**, damit Decap CMS Änderungen als Commits in den Branch `main` schreiben kann.
4. Decap CMS unter `https://hoenscheidt-publishing-admin.netlify.app/admin/`.

Nach dem Speichern im CMS erzeugt Git Gateway einen Commit im Repository. Die öffentliche Website wird sichtbar aktualisiert, sobald GitHub Pages den neuen Commit veröffentlicht hat.

## Netlify Identity Callback

Einladungs-, Passwort-Reset-, E-Mail-Bestätigungs- und E-Mail-Änderungslinks von Netlify Identity werden über `auth-callback.html` verarbeitet.

Falls ein Netlify-E-Mail-Link zunächst auf die Startseite zeigt, erkennt `index.html` die Identity-Tokens im URL-Hash und leitet inklusive Hash an `/auth-callback.html` weiter.

Nach Änderungen an dieser Callback-Seite oder an der Weiterleitungslogik ist ein neuer Netlify-Deploy nötig, damit die Netlify-Domain `https://hoenscheidt-publishing-admin.netlify.app/` die aktuelle Version ausliefert.

## Manuskripteinreichung

- Formularseite: `https://hoenscheidt-publishing.de/autorinnen.html`
- Besucherinnen und Besucher bleiben beim Absenden auf der GitHub-Pages-Seite.
- Das Formular sendet im Hintergrund an die Netlify Function `manuskript-einreichung`.
- Die aktuell konfigurierte Function-URL lautet `https://hoenscheidt-publishing-admin.netlify.app/.netlify/functions/manuskript-einreichung`.
- Dateien werden nicht in GitHub gespeichert.
- Manuskriptdateien und Metadaten werden getrennt in Netlify Blobs gespeichert.
- Es gibt keine öffentliche Download-URL für eingereichte Manuskripte.
- Zulässige Dateitypen: PDF, DOC, DOCX.
- Maximale Dateigröße: 4 MB.
- Das einfache serverseitige Rate-Limit erlaubt maximal 3 Einreichungen pro IP-Hash pro Stunde.
- Das Rate-Limit speichert keine rohe IP-Adresse und ist ein Basisschutz gegen Missbrauch. Es ist kein vollständiger DDoS-Schutz.

### Speicherung in Netlify Blobs

Die Function `manuskript-einreichung` speichert Manuskriptdateien im Blob-Store `manuscript-files`. Zugehörige Metadaten werden getrennt im Blob-Store `manuscript-metadata` gespeichert.

Die eingereichten Dateien werden nicht über GitHub oder GitHub Pages bereitgestellt. Prüfung und Verwaltung erfolgen über das Netlify-Dashboard beziehungsweise geschützte interne Werkzeuge.

## Löschung eingereichter Manuskripte

Die Scheduled Function `loesche-abgelaufene-manuskripte` läuft täglich.

Sie prüft die gespeicherten Metadaten und löscht Manuskriptdateien sowie zugehörige Metadaten nach Ablauf des gespeicherten Löschdatums aus den Netlify-Blob-Stores `manuscript-files` und `manuscript-metadata`.

Einträge ohne gültiges Löschdatum werden nicht automatisch gelöscht. Die Function schreibt dafür technische Logs ohne Namen, E-Mail-Adressen, Manuskripttitel oder andere bewusst ausgegebene personenbezogene Inhalte.

Die Löschfunktion sollte regelmäßig im Netlify-Dashboard kontrolliert werden. Prüfen Sie insbesondere, ob die Scheduled Function registriert ist, täglich ausgeführt wird und keine technischen Fehler meldet.

Die rechtliche Ausgestaltung von Speicherdauer und Löschprozessen sollte zusätzlich geprüft werden.

## Netlify Deploy und Checks

Netlify führt beim Deploy `npm run check` aus.

Dabei laufen Syntaxprüfungen für:

- `assets/js/main.js`
- `netlify/functions/manuskript-einreichung.mjs`
- `netlify/functions/loesche-abgelaufene-manuskripte.mjs`

Aktuelle Netlify-Einstellungen:

- Build command: `npm run check`
- Publish directory: `.`
- Functions directory: `netlify/functions`

Die Dependencies für die Functions stehen in `package.json`, darunter `@netlify/blobs`, `@netlify/functions` und `busboy`.

## Testanleitung

### Öffentliche Website

- GitHub-Pages-Deploy prüfen.
- Startseite unter `https://hoenscheidt-publishing.de` öffnen.
- Bücherseite öffnen.
- „Mehr erfahren“-Links testen.
- Leseproben testen.

### Admin

- Netlify Admin öffnen: `https://hoenscheidt-publishing-admin.netlify.app/admin/`
- Login prüfen.
- Test-Buch nur mit Testdaten anlegen.
- Nach dem Test prüfen, ob der CMS-Commit korrekt im Repository angekommen ist.

### Manuskriptformular

- Kleine harmlose Test-PDF unter 4 MB verwenden.
- Formular unter `https://hoenscheidt-publishing.de/autorinnen.html` absenden.
- Prüfen, dass die Browser-URL auf `https://hoenscheidt-publishing.de/autorinnen.html` bleibt.
- Erfolgsmeldung direkt auf der Formularseite prüfen.
- Netlify Function Logs der Function `manuskript-einreichung` prüfen.
- Blob-Stores `manuscript-files` und `manuscript-metadata` prüfen.
- Testeinreichung anschließend manuell aus Netlify Blobs entfernen.

### Löschfunktion

- Im Netlify-Dashboard prüfen, ob `loesche-abgelaufene-manuskripte` als Scheduled Function registriert ist.
- Prüfen, ob die Function täglich läuft.
- Logs auf technische Fehler prüfen.

## Schriftarten

Der aktuelle Code lädt keine externen Google Fonts. Es werden derzeit Systemschriften verwendet.

Eine externe Google-Font-Verbindung ist nicht vorgesehen. Der Ordner `assets/fonts/` ist nur für eine mögliche spätere lokale Schrifteinbindung vorbereitet. Legen Sie dort nur lizenzrechtlich geklärte lokale Webfont-Dateien ab und ergänzen Sie danach passende CSS-Regeln.

## Plausible Analytics

Plausible ist im aktuellen Code weiterhin im `<head>` der öffentlichen HTML-Seiten eingebunden. Die Einbindung verwendet ein Script von `https://plausible.io` für die Domain `hoenscheidt-publishing.de`.

Wenn Plausible künftig entfernt oder geändert wird, müssen die HTML-Dateien und diese README entsprechend angepasst werden.

## GitHub Pages

GitHub Pages ist für die öffentliche Website maßgeblich. Die Website benötigt keinen Build-Schritt für die öffentliche Auslieferung: GitHub Pages veröffentlicht die statischen Dateien aus dem Repository.

## Eigene Domain bei STRATO

Die Domain `hoenscheidt-publishing.de` wird bei STRATO verwaltet und per DNS mit GitHub Pages verbunden. DNS-Änderungen erfolgen im STRATO-Kundenbereich nach der jeweils aktuellen GitHub-Pages-Dokumentation.

## Rechtlicher Hinweis

`impressum.html` und `datenschutz.html` enthalten rechtlich relevante Inhalte und teilweise markierte Prüfhinweise. Diese Seiten müssen vor Veröffentlichung und nach technischen Änderungen rechtlich geprüft werden.

Das gilt insbesondere für Anbieterkennzeichnung, Verantwortliche, Kontaktangaben, Hosting-Angaben, Plausible Analytics, Netlify Functions, Netlify Blobs, Manuskripteinreichungen, Speicherdauer und Löschprozesse.

## Nächste Schritte

1. Netlify Identity und Git Gateway im Admin-Projekt regelmäßig prüfen.
2. Inhalte und Buchdaten über `https://hoenscheidt-publishing-admin.netlify.app/admin/` pflegen.
3. GitHub-Pages-Deploy nach CMS-Commits prüfen.
4. Netlify Function Logs regelmäßig kontrollieren.
5. Scheduled Function `loesche-abgelaufene-manuskripte` regelmäßig im Netlify-Dashboard kontrollieren.
6. Testeinreichungen nach Tests manuell aus Netlify Blobs entfernen.
7. Rechtliche Ausgestaltung von Speicherdauer und Löschprozessen zusätzlich prüfen lassen.
