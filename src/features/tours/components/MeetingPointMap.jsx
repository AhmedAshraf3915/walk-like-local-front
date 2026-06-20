import { useCallback, useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const EGYPT_CENTER = [26.8206, 30.8025];

const formatCoordinates = (latitude, longitude) =>
  `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

const parseCoordinates = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  const [latitude, longitude] = value.split(",").map(Number);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

export default function MeetingPointMap({ value, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const showMarker = useCallback((latitude, longitude) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      return;
    }

    markerRef.current = L.circleMarker([latitude, longitude], {
      radius: 9,
      color: "#ffffff",
      weight: 3,
      fillColor: "#010170",
      fillOpacity: 1,
    }).addTo(mapRef.current);
  }, []);

  const selectPoint = useCallback(
    (latitude, longitude, centerMap = false) => {
      showMarker(latitude, longitude);

      if (centerMap) {
        mapRef.current?.setView([latitude, longitude], 15);
      }

      onChangeRef.current(formatCoordinates(latitude, longitude));
      setLocationError("");
    },
    [showMarker],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(EGYPT_CENTER, 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const handleMapClick = (event) => {
      selectPoint(event.latlng.lat, event.latlng.lng);
    };

    map.on("click", handleMapClick);
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [selectPoint]);

  useEffect(() => {
    const coordinates = parseCoordinates(value);

    if (coordinates) {
      showMarker(coordinates.latitude, coordinates.longitude);
      return;
    }

    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [showMarker, value]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Current location is not supported by this browser.");
      return;
    }

    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectPoint(
          position.coords.latitude,
          position.coords.longitude,
          true,
        );
      },
      () => {
        setLocationError(
          "Unable to access your location. Select the meeting point on the map.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#010138]">
            Meeting point
          </h3>
          <p className="mt-1 text-xs text-[#65638a]">
            Click the exact pickup location on the map.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useCurrentLocation}
            className="rounded-lg border border-[#d5d4ea] bg-white px-4 py-2 text-xs font-semibold text-[#353572] transition hover:bg-[#f4f4f8]"
          >
            Use my location
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChangeRef.current("")}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-[#8d2f2f] transition hover:bg-[#fff1f1]"
            >
              Clear point
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={containerRef}
        role="application"
        aria-label="Select meeting point on map"
        className="mt-3 h-[360px] overflow-hidden rounded-2xl border border-[#d5d4ea] bg-[#eeeeF6] shadow-inner"
      />

      <div className="mt-3 min-h-5 text-xs">
        {value ? (
          <p className="font-semibold text-[#353572]">
            Selected coordinates: {value}
          </p>
        ) : (
          <p className="text-[#8b89a8]">No meeting point selected.</p>
        )}
        {locationError ? (
          <p className="mt-1 text-[#9a2d2d]">{locationError}</p>
        ) : null}
      </div>
    </div>
  );
}
