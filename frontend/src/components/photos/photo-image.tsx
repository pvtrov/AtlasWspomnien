"use client";

import { useEffect, useState } from "react";

import { fetchCreatorPhotoImage } from "@/services/api-client";

type PhotoImageProps = {
  photoId: number;
  token: string;
  alt: string;
  className?: string;
};

export function PhotoImage({
  photoId,
  token,
  alt,
  className,
}: PhotoImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    async function loadImage(): Promise<void> {
      try {
        setHasError(false);
        const blob = await fetchCreatorPhotoImage(token, photoId);
        if (!isActive) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        if (isActive) {
          setHasError(true);
        }
      }
    }

    void loadImage();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoId, token]);

  if (hasError) {
    return (
      <div className={className ? `${className} photo-image--empty` : "photo-image--empty"}>
        <span>Photo preview unavailable.</span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={className ? `${className} photo-image--empty` : "photo-image--empty"}>
        <span>Loading photo...</span>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
