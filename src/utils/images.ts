/**
 * Product image resolution.
 *
 * Images are stored in Postgres in two columns:
 *   image_url TEXT    -> the primary/cover image
 *   images    TEXT[]  -> the full gallery
 *
 * Both are also exposed by the API in camelCase (`imageUrl` / `images`), and
 * legacy rows may still carry the singular `image` array. Resolution order is
 * therefore: images[0] -> image[0] -> image_url -> imageUrl -> fallback.
 */

export const PRODUCT_IMAGE_FALLBACK = "/images/product-placeholder.svg";

const firstUsableUrl = (list: unknown): string => {
  if (!Array.isArray(list)) return "";
  const match = list.find(
    (url) => typeof url === "string" && url.trim() !== ""
  );
  return typeof match === "string" ? match.trim() : "";
};

const usableUrl = (value: unknown): string =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : "";

/** Full gallery, normalised to a deduped list of trimmed URLs. */
export function getProductImages(product?: unknown): string[] {
  if (!product || typeof product !== "object") return [];
  const source = product as Record<string, unknown>;

  const combined = [
    ...(Array.isArray(source.images) ? source.images : []),
    ...(Array.isArray(source.image) ? source.image : []),
  ];

  const single = usableUrl(source.image_url) || usableUrl(source.imageUrl);
  if (single) combined.push(single);

  return Array.from(
    new Set(
      combined
        .filter((url) => typeof url === "string" && url.trim() !== "")
        .map((url) => (url as string).trim())
    )
  );
}

/**
 * Primary product image, following `images[0]` -> `image[0]` -> `image_url`
 * -> `imageUrl`. Falls back to the shared placeholder when nothing is set.
 */
export function getProductImage(product?: unknown): string {
  return getProductImages(product)[0] ?? PRODUCT_IMAGE_FALLBACK;
}
