import { createHash, randomUUID } from 'node:crypto';
import Busboy from 'busboy';
import { getStore } from '@netlify/blobs';

const ALLOWED_ORIGINS = new Set([
  'https://hoenscheidt-publishing.de',
  'https://www.hoenscheidt-publishing.de',
  'http://localhost:8888',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const RATE_LIMIT_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ALLOWED_FILES = new Map([
  ['pdf', new Set(['application/pdf'])],
  ['doc', new Set(['application/msword'])],
  ['docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])]
]);
const REQUIRED_FIELDS = [
  'name',
  'email',
  'manuskript-titel',
  'genre',
  'projektbeschreibung',
  'datenschutz-hinweis-gelesen'
];

function corsHeaders(origin) {
  if (!ALLOWED_ORIGINS.has(origin)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function json(statusCode, message, headers = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
    body: JSON.stringify({ message })
  };
}

function clientIp(event) {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function hashIp(ip) {
  return createHash('sha256').update(String(ip)).digest('hex');
}

async function checkRateLimit(ip) {
  const store = getStore('manuscript-metadata');
  const key = `rate-limit/${hashIp(ip)}`;
  const now = Date.now();
  const current = await store.get(key, { type: 'json' }).catch(() => null);
  const inCurrentWindow = current && now - current.windowStart < RATE_LIMIT_WINDOW_MS;
  const attempts = inCurrentWindow ? current.attempts : 0;

  if (attempts >= RATE_LIMIT_ATTEMPTS) return false;

  await store.setJSON(key, {
    attempts: attempts + 1,
    windowStart: inCurrentWindow ? current.windowStart : now
  });
  return true;
}

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      reject(new Error('INVALID_CONTENT_TYPE'));
      return;
    }

    const fields = {};
    const files = [];
    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: { files: 1, fileSize: MAX_FILE_SIZE, fields: 20 }
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });
    busboy.on('file', (fieldName, stream, info) => {
      const chunks = [];
      let size = 0;
      let limited = false;

      stream.on('data', (chunk) => {
        size += chunk.length;
        chunks.push(chunk);
      });
      stream.on('limit', () => {
        limited = true;
      });
      stream.on('end', () => {
        files.push({
          fieldName,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
          size,
          limited
        });
      });
    });
    busboy.on('filesLimit', () => reject(new Error('TOO_MANY_FILES')));
    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ fields, files }));
    busboy.end(Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8'));
  });
}

function validate(fields, files) {
  if (fields['bot-field']) return { spam: true };

  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) return { error: 'Bitte füllen Sie alle Pflichtfelder aus.' };
  }

  if (!/^\S+@\S+\.\S+$/.test(fields.email)) {
    return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
  }

  if (files.length !== 1 || files[0].fieldName !== 'manuskript-datei') {
    return { error: 'Bitte laden Sie genau eine Manuskript-Datei hoch.' };
  }

  const file = files[0];
  if (file.limited || file.size > MAX_FILE_SIZE) {
    return { error: 'Die Manuskript-Datei ist zu groß. Bitte laden Sie eine Datei mit maximal 8 MB hoch.' };
  }

  const extension = file.filename?.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_FILES.has(extension) || !ALLOWED_FILES.get(extension).has(file.mimeType)) {
    return { error: 'Bitte laden Sie eine Datei im Format PDF, DOC oder DOCX hoch.' };
  }

  return { file };
}

export default async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (!headers['Access-Control-Allow-Origin']) {
    return json(403, 'Diese Herkunft ist für Einreichungen nicht freigegeben.', headers);
  }

  if (event.httpMethod !== 'POST') {
    return json(405, 'Diese Anfrage wird nicht unterstützt.', headers);
  }

  try {
    const { fields, files } = await parseMultipart(event);
    const validation = validate(fields, files);

    if (validation.spam) {
      return json(200, 'Vielen Dank. Ihre Einreichung wurde übermittelt.', headers);
    }

    if (validation.error) {
      return json(400, validation.error, headers);
    }

    if (!(await checkRateLimit(clientIp(event)))) {
      return json(429, 'Zu viele Einreichungsversuche. Bitte versuchen Sie es später erneut.', headers);
    }

    const id = randomUUID();
    const submittedAt = new Date();
    const deleteAfter = new Date(submittedAt.getTime() + 60 * 24 * 60 * 60 * 1000);
    const filesStore = getStore('manuscript-files');
    const metadataStore = getStore('manuscript-metadata');

    await filesStore.set(id, validation.file.buffer, { metadata: { mimeType: validation.file.mimeType } });
    await metadataStore.setJSON(id, {
      uuid: id,
      submittedAt: submittedAt.toISOString(),
      deleteAfter: deleteAfter.toISOString(),
      name: fields.name,
      email: fields.email,
      telefon: fields.telefon || '',
      manuskriptTitel: fields['manuskript-titel'],
      genre: fields.genre,
      projektbeschreibung: fields.projektbeschreibung,
      umfang: fields.umfang || '',
      vita: fields.vita || '',
      profilLink: fields['profil-link'] || '',
      originalFilename: validation.file.filename,
      mimeType: validation.file.mimeType,
      fileSize: validation.file.size,
      status: 'neu'
    });

    return json(
      200,
      'Vielen Dank. Ihre Einreichung wurde übermittelt. Wir prüfen Ihr Manuskript sorgfältig und melden uns bei Interesse.',
      headers
    );
  } catch (error) {
    if (error.message === 'INVALID_CONTENT_TYPE') {
      return json(400, 'Die Einreichung muss als Formular mit Datei-Upload gesendet werden.', headers);
    }
    if (error.message === 'TOO_MANY_FILES') {
      return json(400, 'Bitte laden Sie genau eine Manuskript-Datei hoch.', headers);
    }

    console.error('Manuscript submission failed');
    return json(500, 'Die Einreichung konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.', headers);
  }
};
