import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "oo371u7j",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true
});
