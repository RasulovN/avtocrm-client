import { useEffect, useRef, useState } from 'react';
import { geoApi } from '../services';
import { logger } from '../../../utils/logger';

// Yandex Maps (2.1) — faqat shu komponentda ishlatiladigan minimal tip ta'riflari.
interface YmapsGeometry {
  setCoordinates(coords: number[]): void;
  getCoordinates(): number[];
}
interface YmapsPlacemark {
  geometry: YmapsGeometry;
  events: { add(event: string, cb: () => void): void };
}
interface YmapsMap {
  geoObjects: { add(obj: YmapsPlacemark): void };
  events: { add(event: string, cb: (e: { get(key: string): number[] }) => void): void };
}
interface Ymaps {
  ready(cb: () => void): void;
  Map: new (
    el: HTMLElement,
    opts: { center: number[]; zoom: number; controls: string[] },
  ) => YmapsMap;
  Placemark: new (
    coords: number[],
    properties: object,
    opts: { draggable: boolean },
  ) => YmapsPlacemark;
}

// Yandex Maps skriptini bir marta yuklaydi
let scriptPromise: Promise<void> | null = null;
function loadYmaps(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject();
  const w = window as unknown as { ymaps?: { ready: (cb: () => void) => void } };
  if (w.ymaps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
    s.async = true;
    s.onload = () => {
      const yw = window as unknown as { ymaps: { ready: (cb: () => void) => void } };
      yw.ymaps.ready(() => resolve());
    };
    s.onerror = () => reject(new Error('Yandex Maps yuklanmadi'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

export function YandexMapPicker({ latitude, longitude, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YmapsMap | null>(null);
  const placemarkRef = useRef<YmapsPlacemark | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;
        if (!apiKey) {
          try {
            apiKey = (await geoApi.yandexKey()).api_key;
          } catch (err) {
            logger.debug('Yandex kalitini backenddan olib bo\'lmadi', { error: err instanceof Error ? err.message : String(err) });
          }
        }
        if (!apiKey) { setError("Yandex Maps API kaliti topilmadi"); return; }
        await loadYmaps(apiKey);
        if (cancelled || !ref.current) return;

        const yw = window as unknown as { ymaps: Ymaps };
        const center = [Number(latitude) || 41.311081, Number(longitude) || 69.240562];
        const map = new yw.ymaps.Map(ref.current, { center, zoom: 11, controls: ['zoomControl', 'searchControl'] });
        mapRef.current = map;

        const setMark = (coords: number[]) => {
          if (placemarkRef.current) {
            placemarkRef.current.geometry.setCoordinates(coords);
          } else {
            const pm = new yw.ymaps.Placemark(coords, {}, { draggable: true });
            pm.events.add('dragend', () => {
              const c = pm.geometry.getCoordinates();
              onChange(c[0].toFixed(6), c[1].toFixed(6));
            });
            map.geoObjects.add(pm);
            placemarkRef.current = pm;
          }
          onChange(coords[0].toFixed(6), coords[1].toFixed(6));
        };

        if (latitude && longitude) setMark([Number(latitude), Number(longitude)]);

        map.events.add('click', (e) => setMark(e.get('coords')));
      } catch (err) {
        logger.error('Yandex xaritasini yuklab bo\'lmadi', { error: err instanceof Error ? err.message : String(err) });
        if (!cancelled) setError("Xaritani yuklab bo'lmadi");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
        {error}. Koordinatalarni qo'lda kiriting.
      </div>
    );
  }

  return <div ref={ref} className="w-full h-[320px] rounded-xl overflow-hidden border border-border/60" />;
}
