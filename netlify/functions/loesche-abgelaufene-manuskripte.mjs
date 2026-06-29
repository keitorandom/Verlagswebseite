import { schedule } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

async function deleteExpiredManuscripts() {
  const filesStore = getStore('manuscript-files');
  const metadataStore = getStore('manuscript-metadata');
  const now = new Date();
  let deleted = 0;
  let cursor;

  do {
    const page = await metadataStore.list({ cursor });
    cursor = page.cursor;

    for (const blob of page.blobs) {
      if (blob.key.startsWith('rate-limit/')) continue;
      const metadata = await metadataStore.get(blob.key, { type: 'json' }).catch(() => null);
      if (!metadata?.deleteAfter || new Date(metadata.deleteAfter) > now) continue;
      await filesStore.delete(metadata.uuid || blob.key);
      await metadataStore.delete(blob.key);
      deleted += 1;
    }
  } while (cursor);

  console.log(`Expired manuscript cleanup completed. Deleted: ${deleted}`);
  return new Response(JSON.stringify({ deleted }), { headers: { 'Content-Type': 'application/json' } });
}

export const handler = schedule('@daily', deleteExpiredManuscripts);
