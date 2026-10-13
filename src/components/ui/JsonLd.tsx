import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Emits one `application/ld+json` block.
 *
 * Every structured-data block on the site goes through here so there is a
 * single place that handles the escaping below, and a single thing to grep for.
 *
 * ⚠️ `</script>` inside a JSON string value would close this tag early and
 * spill the rest of the payload into the document as markup. Sanity content is
 * author-controlled rather than visitor-controlled, so this is defence in
 * depth rather than a live hole — but the escape costs nothing and the failure
 * mode is a broken page, not a broken snippet.
 */
export const JsonLd: React.FC<{ data: Record<string, unknown> }> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data).replace(/</g, '\\u003c')}</script>
  </Helmet>
);
