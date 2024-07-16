import React, { useEffect, useState } from "react";
import store from "@src/store";

export type EncodedImageProps = React.HTMLAttributes<HTMLImageElement> & {
  encSrc: string;
  alt?: string;
};

export default function EncodedImage({
  encSrc,
  alt = "Encoded Image",
  ...rest
}: EncodedImageProps) {
  const [base64, setBase64] = useState<string | undefined>(undefined);

  useEffect(() => {
    store.fetchImageBase64(encSrc).then(setBase64);
  }, [encSrc]);

  return base64 ? (
    <img src={`data:image/png;base64,${base64}`} alt={alt} {...rest} />
  ) : (
    <p>Loading...</p>
  );
}
