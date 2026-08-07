import React from 'react';
import { announcements } from '../mock';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  const items = [...announcements, ...announcements];
  return (
    <div className="w-full bg-forest text-cream overflow-hidden">
      <div className="hover-pause">
        <div className="marquee-track flex whitespace-nowrap py-2 text-[12px]">
          {items.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-6 shrink-0 mono uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-coral" />
              <span>{t}</span>
              <span className="text-coral">/</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
