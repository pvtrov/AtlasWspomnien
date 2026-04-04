"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CENTER = { latitude: 52.2297, longitude: 21.0122 };
const TILE_SIZE = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 16;
const VIEW_PADDING = 48;

export type PhotoMapPoint = {
  id: number | string;
  latitude: number;
  longitude: number;
  label: string;
};

type MapCenter = {
  latitude: number;
  longitude: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type Props = {
  points: PhotoMapPoint[];
  selectedPointId?: number | string | null;
  pin?: MapCenter | null;
  preferFocusPoint?: boolean;
  editable?: boolean;
  onSelectPoint?: (pointId: number | string) => void;
  onSetPin?: (coordinates: MapCenter) => void;
  emptyLabel: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function wrapTileX(x: number, zoom: number): number {
  const tileCount = 2 ** zoom;
  return ((x % tileCount) + tileCount) % tileCount;
}

function latLngToWorld(latitude: number, longitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latRad = (latitude * Math.PI) / 180;
  const x = ((longitude + 180) / 360) * scale;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    scale;

  return { x, y };
}

function worldToLatLng(x: number, y: number, zoom: number): MapCenter {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return { latitude, longitude };
}

function deriveView(points: MapCenter[], viewport: ViewportSize): {
  center: MapCenter;
  zoom: number;
} {
  if (points.length === 0) {
    return { center: DEFAULT_CENTER, zoom: 6 };
  }

  if (points.length === 1) {
    return { center: points[0], zoom: 13 };
  }

  const minLatitude = Math.min(...points.map((point) => point.latitude));
  const maxLatitude = Math.max(...points.map((point) => point.latitude));
  const minLongitude = Math.min(...points.map((point) => point.longitude));
  const maxLongitude = Math.max(...points.map((point) => point.longitude));
  const center = {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
  };

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const worldPoints = points.map((point) =>
      latLngToWorld(point.latitude, point.longitude, zoom),
    );
    const xs = worldPoints.map((point) => point.x);
    const ys = worldPoints.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);

    if (
      width <= viewport.width - VIEW_PADDING * 2 &&
      height <= viewport.height - VIEW_PADDING * 2
    ) {
      return { center, zoom };
    }
  }

  return { center, zoom: MIN_ZOOM };
}

export function SimplePhotoMap({
  points,
  selectedPointId = null,
  pin = null,
  preferFocusPoint = false,
  editable = false,
  onSelectPoint,
  onSetPin,
  emptyLabel,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 720,
    height: 420,
  });

  useEffect(() => {
    const element = mapRef.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setViewport({
        width: Math.max(Math.floor(entry.contentRect.width), 320),
        height: Math.max(Math.floor(entry.contentRect.height), 280),
      });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const activePoints = useMemo(() => {
    if (pin) {
      return [pin];
    }

    return points;
  }, [pin, points]);

  const selectedPoint = useMemo(
    () => points.find((point) => point.id === selectedPointId) ?? null,
    [points, selectedPointId],
  );

  const { center, zoom } = useMemo(() => {
    const focusPoint = pin ?? (selectedPoint ? {
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
    } : null);

    if (focusPoint && preferFocusPoint) {
      return { center: focusPoint, zoom: points.length <= 1 ? 13 : 12 };
    }

    return deriveView(activePoints, viewport);
  }, [activePoints, pin, points.length, preferFocusPoint, selectedPoint, viewport]);

  const centerWorld = latLngToWorld(center.latitude, center.longitude, zoom);
  const topLeftX = centerWorld.x - viewport.width / 2;
  const topLeftY = centerWorld.y - viewport.height / 2;
  const tileStartX = Math.floor(topLeftX / TILE_SIZE);
  const tileEndX = Math.floor((topLeftX + viewport.width) / TILE_SIZE);
  const tileStartY = Math.floor(topLeftY / TILE_SIZE);
  const tileEndY = Math.floor((topLeftY + viewport.height) / TILE_SIZE);
  const maxTileY = 2 ** zoom - 1;

  const tiles = [];
  for (let tileX = tileStartX; tileX <= tileEndX; tileX += 1) {
    for (let tileY = tileStartY; tileY <= tileEndY; tileY += 1) {
      if (tileY < 0 || tileY > maxTileY) {
        continue;
      }

      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrapTileX(tileX, zoom)}/${tileY}.png`,
        left: tileX * TILE_SIZE - topLeftX,
        top: tileY * TILE_SIZE - topLeftY,
      });
    }
  }

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>): void {
    if (!editable || !onSetPin || !mapRef.current) {
      return;
    }

    const bounds = mapRef.current.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;
    const clickWorldX = topLeftX + clickX;
    const clickWorldY = topLeftY + clickY;
    const coordinates = worldToLatLng(clickWorldX, clickWorldY, zoom);

    onSetPin({
      latitude: clamp(coordinates.latitude, -85, 85),
      longitude: clamp(coordinates.longitude, -180, 180),
    });
  }

  return (
    <div className="photo-map">
      <div
        ref={mapRef}
        className={`photo-map__viewport${editable ? " photo-map__viewport--editable" : ""}`}
        onClick={handleMapClick}
        role={editable ? "application" : "img"}
        aria-label={emptyLabel}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            className="photo-map__tile"
            style={{ left: tile.left, top: tile.top }}
            draggable={false}
          />
        ))}

        {points.map((point) => {
          const projected = latLngToWorld(point.latitude, point.longitude, zoom);
          const left = projected.x - topLeftX;
          const top = projected.y - topLeftY;

          if (
            left < -24 ||
            left > viewport.width + 24 ||
            top < -24 ||
            top > viewport.height + 24
          ) {
            return null;
          }

          return (
            <button
              key={point.id}
              type="button"
              className={`photo-map__marker${
                point.id === selectedPointId ? " photo-map__marker--selected" : ""
              }`}
              style={{ left, top }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectPoint?.(point.id);
              }}
              aria-label={point.label}
            />
          );
        })}

        {pin ? (
          <div
            className="photo-map__pin"
            style={{
              left: latLngToWorld(pin.latitude, pin.longitude, zoom).x - topLeftX,
              top: latLngToWorld(pin.latitude, pin.longitude, zoom).y - topLeftY,
            }}
            aria-hidden="true"
          />
        ) : null}

        {points.length === 0 && !pin ? (
          <div className="photo-map__empty">
            <p>{emptyLabel}</p>
          </div>
        ) : null}
      </div>

      <p className="photo-map__credit">
        Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
      </p>
    </div>
  );
}
