import { MapPin } from 'lucide-react';
import { HOME_EVENT } from '../../content/homeEvent';

export function HomeVenueMap() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="hud-stat text-xl tracking-wide text-paper sm:text-2xl">{HOME_EVENT.venueName}</p>
        <a
          href={HOME_EVENT.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
        >
          <MapPin className="h-4 w-4 opacity-70" />
          Google Maps
        </a>
      </div>
      <div className="relative mt-6 aspect-video w-full overflow-hidden border border-paper/20 bg-ink-deep">
        <iframe
          title="Hollywood Ground location"
          src={HOME_EVENT.mapsEmbedUrl}
          className="absolute inset-0 h-full w-full grayscale contrast-[0.95] brightness-[0.85]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
