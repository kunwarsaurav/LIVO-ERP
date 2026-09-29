'use client';

import React, { useState } from 'react';

import { getProductImage, PRODUCT_IMAGE_FALLBACK } from '@/utils/images';

interface ProductImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  product?: unknown;
  src?: string | null;
}

/**
 * Renders a product image resolved as `images[0]` -> `image[0]` -> `image_url`
 * -> `imageUrl`, and swaps in the shared placeholder when the resolved URL is
 * empty or fails to load.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  src,
  alt = 'Product image',
  ...rest
}) => {
  const resolved = src || getProductImage(product);
  const [current, setCurrent] = useState(resolved);

  React.useEffect(() => {
    setCurrent(resolved);
  }, [resolved]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      src={current}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={(event) => {
        if (current === PRODUCT_IMAGE_FALLBACK) return;
        setCurrent(PRODUCT_IMAGE_FALLBACK);
        event.currentTarget.onerror = null;
      }}
    />
  );
};

export default ProductImage;
