"use client";

import { useEffect, useState } from "react";

import { getSharedPhotoImageUrl } from "@/services/api-client";

type PhotoImageProps = {
  photoId: number;
  alt: string;
  className?: string;
};

export function PhotoImage({ photoId, alt, className }: PhotoImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [photoId]);

  if (hasError) {
    return (
      <div className={className ? `${className} photo-image--empty` : "photo-image--empty"}>
        <span>Photo preview unavailable.</span>
      </div>
    );
  }

  return (
    <img
      src={getSharedPhotoImageUrl(photoId)}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
