# Hönscheidt Publishing Website

Statische, responsive Website für den unabhängigen Verlag **Hönscheidt Publishing**. Die öffentliche Website läuft weiterhin ohne eigenes Backend, ohne Framework, ohne Node.js und ohne Build-Schritt über GitHub Pages. Buchdaten werden zentral in `data/books.json` gepflegt und können zusätzlich über Decap CMS im geschützten Adminbereich bearbeitet werden.

## Projektstruktur

```text
/
  index.html                    # Startseite
  buecher.html                  # Bücherübersicht mit Leseproben
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
    css/style.css               # Gestaltung und responsive Layouts
    js/main.js                  # Mobile Navigation und Buch-Rendering
    images/
      README.md                 # Hinweise für spätere Bilder
      uploads/.gitkeep          # Zielordner für CMS-Coveruploads
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

`impressum.html` und `datenschutz.html` enthalten bewusst markierte Platzhalter. Beide Seiten müssen vor Veröffentlichung vollständig ergänzt und rechtlich geprüft werden. Dies gilt insbesondere für Anbieterkennzeichnung, Verantwortliche, Kontaktangaben, Hosting-Angaben, Google-Fonts-Einbindung und mögliche spätere Funktionen wie Kontaktformular, Newsletter oder Tracking.

## Nächste Schritte

1. Netlify Identity und Git Gateway vollständig einrichten
2. Erste Bücher über `/admin/` pflegen
3. Impressum und Datenschutz rechtlich ergänzen
4. STRATO-DNS mit GitHub Pages verbinden
5. HTTPS in GitHub Pages prüfen oder aktivieren
