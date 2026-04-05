"use client";

import { useEffect, useState } from "react";

import {
  geocodeLocation,
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/api-client";
import { SimplePhotoMap } from "@/components/photos/simple-photo-map";

type Props = {
  locationText: string;
  latitudeText: string;
  longitudeText: string;
  onLocationTextChange: (value: string) => void;
  onLatitudeTextChange: (value: string) => void;
  onLongitudeTextChange: (value: string) => void;
};

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function PhotoLocationEditor({
  locationText,
  latitudeText,
  longitudeText,
  onLocationTextChange,
  onLatitudeTextChange,
  onLongitudeTextChange,
}: Props) {
  const [message, setMessage] = useState(
    "Type a location to get address suggestions, or enter coordinates manually and place a pin on the map.",
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [selectedSuggestionLabel, setSelectedSuggestionLabel] = useState("");

  const hasCoordinates = latitudeText.trim() !== "" && longitudeText.trim() !== "";
  const pin = hasCoordinates
    ? {
        latitude: Number(latitudeText),
        longitude: Number(longitudeText),
      }
    : null;

  useEffect(() => {
    const trimmedLocation = locationText.trim();

    if (trimmedLocation.length < 3) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    if (trimmedLocation === selectedSuggestionLabel) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingSuggestions(true);

      try {
        const nextSuggestions = await searchLocationSuggestions(trimmedLocation);
        if (!isCancelled) {
          setSuggestions(nextSuggestions);
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [locationText, selectedSuggestionLabel]);

  async function handleGeocode(): Promise<void> {
    if (!locationText.trim()) {
      setMessage("Enter a location name or address first.");
      return;
    }

    setIsGeocoding(true);

    try {
      const match = await geocodeLocation(locationText);
      if (!match) {
        setMessage("No coordinates were found for that typed location. You can still place a pin manually.");
        return;
      }

      onLatitudeTextChange(formatCoordinate(match.latitude));
      onLongitudeTextChange(formatCoordinate(match.longitude));
      setMessage(`Coordinates resolved from "${match.label}".`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not geocode this location.",
      );
    } finally {
      setIsGeocoding(false);
    }
  }

  function handleClearCoordinates(): void {
    onLatitudeTextChange("");
    onLongitudeTextChange("");
    setMessage("Coordinates cleared. The human-readable location text remains unchanged.");
  }

  function handleSuggestionSelect(suggestion: LocationSuggestion): void {
    setSelectedSuggestionLabel(suggestion.label);
    onLocationTextChange(suggestion.label);
    onLatitudeTextChange(formatCoordinate(suggestion.latitude));
    onLongitudeTextChange(formatCoordinate(suggestion.longitude));
    setSuggestions([]);
    setMessage(`Location and coordinates resolved from "${suggestion.label}".`);
  }

  return (
    <section className="location-editor">
      <div className="photo-form__grid">
        <div className="auth-field">
          <label htmlFor="location_text">Location</label>
          <input
            id="location_text"
            name="location_text"
            type="text"
            value={locationText}
            onChange={(event) => {
              setSelectedSuggestionLabel("");
              onLocationTextChange(event.target.value);
            }}
          />
          <p className="location-editor__hint">
            Pick an address suggestion to fill in both the location text and coordinates automatically.
          </p>
          {isSearchingSuggestions ? (
            <p className="location-editor__hint">Searching suggestions...</p>
          ) : null}
          {!isSearchingSuggestions && suggestions.length > 0 ? (
            <div className="location-suggestions" role="listbox" aria-label="Location suggestions">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                  type="button"
                  className="location-suggestions__item"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            inputMode="decimal"
            step="0.000001"
            min="-90"
            max="90"
            value={latitudeText}
            onChange={(event) => onLatitudeTextChange(event.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            inputMode="decimal"
            step="0.000001"
            min="-180"
            max="180"
            value={longitudeText}
            onChange={(event) => onLongitudeTextChange(event.target.value)}
          />
        </div>
      </div>

      <div className="photo-panel__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => void handleGeocode()}
          disabled={isGeocoding}
        >
          {isGeocoding ? "Resolving..." : "Resolve typed location"}
        </button>

        <button
          type="button"
          className="button button--secondary"
          onClick={handleClearCoordinates}
        >
          Clear coordinates
        </button>
      </div>

      <SimplePhotoMap
        points={[]}
        pin={pin}
        preferFocusPoint
        editable
        onSetPin={(coordinates) => {
          onLatitudeTextChange(formatCoordinate(coordinates.latitude));
          onLongitudeTextChange(formatCoordinate(coordinates.longitude));
          setMessage("Pin placed on the map.");
        }}
        emptyLabel="Click to place a location pin for this photo."
      />

      <p className="auth-form__message" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
