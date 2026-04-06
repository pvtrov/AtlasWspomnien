"use client";

import { useEffect, useRef, useState } from "react";

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
    "Wpisz miejsce, aby dostać podpowiedzi adresów, albo ustaw współrzędne ręcznie i wskaż pinezkę na mapie.",
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [selectedSuggestionLabel, setSelectedSuggestionLabel] = useState("");
  const [isLocationFieldActive, setIsLocationFieldActive] = useState(false);
  const locationFieldRef = useRef<HTMLDivElement | null>(null);

  const hasCoordinates = latitudeText.trim() !== "" && longitudeText.trim() !== "";
  const pin = hasCoordinates
    ? {
        latitude: Number(latitudeText),
        longitude: Number(longitudeText),
      }
    : null;

  useEffect(() => {
    const trimmedLocation = locationText.trim();

    if (!isLocationFieldActive || trimmedLocation.length < 3) {
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
  }, [isLocationFieldActive, locationText, selectedSuggestionLabel]);

  async function handleGeocode(): Promise<void> {
    if (!locationText.trim()) {
      setMessage("Najpierw wpisz nazwę miejsca albo adres.");
      return;
    }

    setIsGeocoding(true);

    try {
      const match = await geocodeLocation(locationText);
      if (!match) {
        setMessage("Nie znaleziono współrzędnych dla podanej lokalizacji. Nadal możesz ustawić pinezkę ręcznie.");
        return;
      }

      onLatitudeTextChange(formatCoordinate(match.latitude));
      onLongitudeTextChange(formatCoordinate(match.longitude));
      setMessage(`Ustalono współrzędne na podstawie lokalizacji „${match.label}”.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się ustalić współrzędnych dla tej lokalizacji.",
      );
    } finally {
      setIsGeocoding(false);
    }
  }

  function handleClearCoordinates(): void {
    onLatitudeTextChange("");
    onLongitudeTextChange("");
    setMessage("Współrzędne zostały wyczyszczone. Tekst lokalizacji pozostał bez zmian.");
  }

  function handleSuggestionSelect(suggestion: LocationSuggestion): void {
    setSelectedSuggestionLabel(suggestion.label);
    onLocationTextChange(suggestion.label);
    onLatitudeTextChange(formatCoordinate(suggestion.latitude));
    onLongitudeTextChange(formatCoordinate(suggestion.longitude));
    setSuggestions([]);
    setMessage(`Uzupełniono lokalizację i współrzędne na podstawie „${suggestion.label}”.`);
  }

  return (
    <section className="location-editor">
      <div className="location-editor__layout">
        <div
          ref={locationFieldRef}
          className="auth-field location-editor__location-field"
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget;
            if (
              nextTarget instanceof Node &&
              locationFieldRef.current?.contains(nextTarget)
            ) {
              return;
            }

            setIsLocationFieldActive(false);
            setSuggestions([]);
            setIsSearchingSuggestions(false);
          }}
        >
          <label htmlFor="location_text">Lokalizacja</label>
          <input
            id="location_text"
            name="location_text"
            type="text"
            value={locationText}
            onFocus={() => setIsLocationFieldActive(true)}
            onChange={(event) => {
              setSelectedSuggestionLabel("");
              onLocationTextChange(event.target.value);
            }}
          />
          <p className="location-editor__hint">
            Wybierz podpowiedź adresu, aby automatycznie uzupełnić tekst lokalizacji i współrzędne.
          </p>
          {isSearchingSuggestions ? (
            <p className="location-editor__hint">Wyszukiwanie podpowiedzi...</p>
          ) : null}
          {!isSearchingSuggestions && suggestions.length > 0 ? (
            <div className="location-suggestions" role="listbox" aria-label="Podpowiedzi lokalizacji">
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

        <div className="location-editor__coordinates">
          <div className="auth-field">
            <label htmlFor="latitude">Szerokość geograficzna</label>
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
            <label htmlFor="longitude">Długość geograficzna</label>
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
      </div>

      <div className="photo-panel__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => void handleGeocode()}
          disabled={isGeocoding}
        >
          {isGeocoding ? "Ustalanie..." : "Ustal współrzędne z wpisanej lokalizacji"}
        </button>

        <button
          type="button"
          className="button button--secondary"
          onClick={handleClearCoordinates}
        >
          Wyczyść współrzędne
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
          setMessage("Pinezka została ustawiona na mapie.");
        }}
        emptyLabel="Kliknij, aby ustawić pinezkę lokalizacji dla tego zdjęcia."
      />

      <p className="auth-form__message" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
