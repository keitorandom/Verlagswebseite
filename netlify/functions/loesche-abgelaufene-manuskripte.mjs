import { getStore } from '@netlify/blobs';

const FILES_STORE = 'manuscript-files';
const METADATA_STORE = 'manuscript-metadata';
const LOG_PREFIX = 'manuscript-cleanup';

function anonymizedKey(key) {
  if (typeof key !== 'string' || key.length === 0) return 'unknown-key';
  return `key-${key.slice(0, 8)}`;
}

function parseDeleteAfter(metadata) {
  if (!metadata || typeof metadata !== 'object') return null;

  const rawDeleteAfter = metadata.deleteAfter;
  if (typeof rawDeleteAfter !== 'string' || rawDeleteAfter.trim() === '') return null;

  const deleteAfter = new Date(rawDeleteAfter);
  if (Number.isNaN(deleteAfter.getTime())) return null;

  return deleteAfter;
}

async function deleteExpiredSubmission({ key, metadata, filesStore, metadataStore, now }) {
  const technicalKey = anonymizedKey(key);
  const deleteAfter = parseDeleteAfter(metadata);

  if (!deleteAfter) {
    console.warn(`${LOG_PREFIX}: invalid or missing deleteAfter`, { key: technicalKey });
    return { checked: 1, deleted: 0, skipped: 1, errors: 0 };
  }

  if (deleteAfter.getTime() > now.getTime()) {
    return { checked: 1, deleted: 0, skipped: 1, errors: 0 };
  }

  try {
    await filesStore.delete(key);
  } catch (error) {
    console.warn(`${LOG_PREFIX}: file deletion reported a technical error`, { key: technicalKey });
  }

  try {
    await metadataStore.delete(key);
    console.info(`${LOG_PREFIX}: expired submission deleted`, { key: technicalKey });
    return { checked: 1, deleted: 1, skipped: 0, errors: 0 };
  } catch (error) {
    console.error(`${LOG_PREFIX}: metadata deletion failed`, { key: technicalKey });
    return { checked: 1, deleted: 0, skipped: 0, errors: 1 };
  }
}

export default async () => {
  const now = new Date();
  const filesStore = getStore(FILES_STORE);
  const metadataStore = getStore(METADATA_STORE);
  const summary = { checked: 0, deleted: 0, skipped: 0, errors: 0 };

  for await (const page of metadataStore.list({ paginate: true })) {
    for (const blob of page.blobs) {
      const key = blob.key;

      if (typeof key !== 'string' || key.startsWith('rate-limit/')) {
        summary.skipped += 1;
        continue;
      }

      try {
        const metadata = await metadataStore.get(key, { type: 'json' });
        const result = await deleteExpiredSubmission({ key, metadata, filesStore, metadataStore, now });

        summary.checked += result.checked;
        summary.deleted += result.deleted;
        summary.skipped += result.skipped;
        summary.errors += result.errors;
      } catch (error) {
        console.error(`${LOG_PREFIX}: record processing failed`, { key: anonymizedKey(key) });
        summary.checked += 1;
        summary.errors += 1;
      }
    }
  }

  console.info(`${LOG_PREFIX}: run completed`, summary);

  return new Response(JSON.stringify(summary), {
    status: summary.errors > 0 ? 207 : 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};

export const config = {
  schedule: '@daily'
};
