import React from 'react';
import {Link} from '@remix-run/react';

function SanityProductLink({value, children}) {
  return (
    <Link
      to={`/products/${value?.productWithVariant?.product?.store?.slug?.current}`}
    >
      {children}
    </Link>
  );
}

export default SanityProductLink;
