import * as React from "react";

export default function Image({ src, alt, width, height, ...props }: any) {
  // If the src starts with an import, it might be an object, but usually in standard next/image it is a string.
  // We just render standard img tag.
  return <img src={src} alt={alt} width={width} height={height} {...props} />;
}
