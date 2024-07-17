import React, { useEffect, useState } from "react";
import store from "@src/store";
import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type EncodedImageProps = React.HTMLAttributes<HTMLImageElement> & {
  encSrc?: string;
  alt?: string;
};

export default function EncodedImage({
  encSrc,
  alt = "Encoded Image",
  ...rest
}: EncodedImageProps) {
  const [base64, setBase64] = useState<string | null>(null);

  const encSrcStaticRef = useStableCurrentRef(encSrc);

  useEffect(() => {
    if (encSrcStaticRef.current !== encSrc) {
      setBase64(null);
    }

    if (encSrc) {
      store.fetchImageBase64(encSrc).then((base64) => {
        if (encSrcStaticRef.current === encSrc) {
          setBase64(base64);
        }
      });
    }
  }, [encSrc, encSrcStaticRef]);

  return base64 ? (
    <img src={`data:image/png;base64,${base64}`} alt={alt} {...rest} />
  ) : (
    // TODO: Update as necessary
    <div style={{ display: "inline-block" }} {...rest} />
  );
}
