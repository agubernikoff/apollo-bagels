import {createClient} from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'gnnsqgu6',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2024-01-01',
});
