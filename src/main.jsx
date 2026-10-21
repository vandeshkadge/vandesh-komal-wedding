import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import './styles.css';
import './music-controls.css';
import './mobile-interactions.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };
const timelineType = { label: { fontFamily: 'Cinzel, serif', letterSpacing: '.3em' }, heading: { fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: '.16em' }, number: { fontFamily: 'Montserrat, sans-serif', letterSpacing: '.16em' }, time: { fontFamily: 'Cinzel, serif', letterSpacing: '.14em' }, title: { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '23px', fontWeight: 500, letterSpacing: '.02em' }, detail: { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', lineHeight: 1.25 }, link: { fontFamily: 'Cinzel, serif', letterSpacing: '.14em' } };
const PauseIcon = () => <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true"><rect x="1" width="3" height="14" rx="1" fill="currentColor" /><rect x="8" width="3" height="14" rx="1" fill="currentColor" /></svg>;
const MapArrow = () => <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true"><path d="M3 11 11 3M6 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-12% 0px' });
  return <motion.div ref={ref} className={`${className} ${visible ? 'is-visible' : ''}`} variants={fadeUp} initial="hidden" animate={visible ? 'visible' : 'hidden'} transition={{ ...transition, delay }}>{children}</motion.div>;
}

function parseDate(date, time, timezone) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const zone = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' }).formatToParts(probe).find(part => part.type === 'timeZoneName')?.value || 'GMT';
  const match = zone.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  const offset = match ? (Number(match[2]) * 60 + Number(match[3] || 0)) * (match[1] === '+' ? 1 : -1) : 0;
  return new Date(probe.getTime() - offset * 60000);
}

function WeddingCalendar({ data, countdown, onDownload }) {
  const [selectedDay, setSelectedDay] = useState(13);
  const year = 2026;
  const month = 11;
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDays = { 11: ['HALDI'], 13: ['PUNYA VACHAN', 'WEDDING CEREMONY', 'RECEPTION'] };
  const selectedEvents = eventDays[selectedDay] || [];
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => index < offset ? null : index - offset + 1);
  while (cells.length % 7) cells.push(null);

  return <Reveal className="section-inner"><small className="eyebrow">MARK YOUR CALENDAR</small><h2>SAVE THE DATE</h2><motion.div className="wedding-calendar" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={transition}>
    <div className="calendar-head"><div><small>WEDDING MONTH</small><strong>DECEMBER <i>{year}</i></strong></div><span className="calendar-badge">{data.wedding.day}</span></div>
    <div className="calendar-week">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid">{cells.map((day, index) => day ? <motion.button key={day} className={`calendar-day ${selectedDay === day ? 'selected' : ''} ${eventDays[day] ? 'has-event' : ''}`} onClick={() => setSelectedDay(day)} whileTap={{ scale: .9 }} layout transition={transition}><span>{day}</span>{eventDays[day] && <i />}</motion.button> : <span className="calendar-empty" key={`empty-${index}`} />)}</div>
    <div className="calendar-selected"><div><small>SELECTED DAY</small><strong>{selectedDay} DECEMBER</strong></div><span>{selectedEvents.length ? `${selectedEvents.length} EVENTS` : 'NO EVENT'}</span></div>
    <AnimatePresence mode="wait"><motion.div key={selectedDay} className="calendar-events" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }}>{selectedEvents.length ? selectedEvents.map(event => <span key={event}><i />{event}</span>) : <span><i />A quiet day in the wedding month</span>}</motion.div></AnimatePresence>
    <motion.button className="calendar-button" onClick={onDownload} whileTap={{ scale: .97 }}><span>＋</span> ADD TO CALENDAR</motion.button>
  </motion.div><div className="countdown">{countdown.map((value, index) => <div key={value + index}><strong>{value}</strong><small>{['DAYS', 'HOURS', 'MINS', 'SECS'][index]}</small></div>)}</div></Reveal>;
}

function App() {
  const [data, setData] = useState(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [rsvpSent, setRsvpSent] = useState(false);
  const audioRef = useRef(null);
  const userPausedMusic = useRef(false);

  useEffect(() => { fetch('/wedding-data.json').then(response => response.json()).then(nextData => { setData(nextData); document.title = `${nextData.couple.displayName} — Wedding Invitation`; const previewImage = new URL(nextData.socialPreview.image, document.baseURI).href; document.querySelector('meta[property="og:title"]')?.setAttribute('content', nextData.socialPreview.title); document.querySelector('meta[property="og:description"]')?.setAttribute('content', nextData.socialPreview.description); document.querySelector('meta[property="og:image"]')?.setAttribute('content', previewImage); document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', nextData.socialPreview.title); document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', nextData.socialPreview.description); document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', previewImage); }); }, []);
  useEffect(() => { if (!data) return; const timer = setInterval(() => setData(current => ({ ...current, _now: Date.now() })), 1000); return () => clearInterval(timer); }, [data]);
  useEffect(() => {
    if (!opened || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const sections = [...document.querySelectorAll('.full-section')];
    let nextSection = 1;
    let timer;
    let cancelled = false;
    const userEvents = ['wheel', 'touchmove', 'keydown'];

    const stop = () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
      userEvents.forEach(eventName => window.removeEventListener(eventName, stop));
    };
    const advance = () => {
      if (cancelled || nextSection >= sections.length) return stop();
      sections[nextSection]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nextSection += 1;
      // One second to glide, then three seconds for the section to be read.
      timer = window.setTimeout(advance, 4000);
    };

    timer = window.setTimeout(advance, 3000);
    userEvents.forEach(eventName => window.addEventListener(eventName, stop, { passive: true }));
    return stop;
  }, [opened]);

  if (!data) return <div className="loading">Preparing your invitation<span>·</span><span>·</span><span>·</span></div>;
  const target = parseDate(data.wedding.date, data.wedding.countdownTime, data.wedding.timezone);
  const diff = Math.max(0, target - (data._now || Date.now()));
  const countdown = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60].map(value => String(value).padStart(2, '0'));
  const openInvitation = async () => {
    if (!opened) setOpened(true);
    if (audioRef.current?.paused && !userPausedMusic.current) {
      try { await audioRef.current.play(); } catch { /* Audio remains available through the play control. */ }
    }
  };
  const toggleAudio = async () => { if (!audioRef.current) return; if (audioRef.current.paused) { try { await audioRef.current.play(); userPausedMusic.current = false; } catch { return; } } else { userPausedMusic.current = true; audioRef.current.pause(); } };
  const copyAddress = async () => { await navigator.clipboard?.writeText(data.venue.address); };
  const downloadCalendar = () => { const ceremony = data.events.find(event => event.id === 'wedding-ceremony'); if (!ceremony) return; const start = parseDate(ceremony.date, data.wedding.countdownTime, data.wedding.timezone).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vandesh and Komal//Wedding Invitation//EN', 'BEGIN:VEVENT', `UID:${ceremony.id}-${data.wedding.date}@vandesh-komal`, `DTSTAMP:${start}`, `DTSTART:${start}`, `SUMMARY:${data.couple.displayName} — Wedding Ceremony`, `LOCATION:${data.venue.name}, ${data.venue.city}`, `DESCRIPTION:${data.wedding.displayDate} at ${ceremony.time}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); link.download = 'vandesh-komal-wedding.ics'; link.click(); URL.revokeObjectURL(link.href); };
  const submitRsvp = async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const endpoint = data.integrations.googleSheets; if (endpoint.enabled && endpoint.webAppUrl) { await fetch(endpoint.webAppUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name: form.get('name'), attendance: form.get('attendance'), guests: guestCount }) }); } setRsvpSent(true); event.currentTarget.reset(); };

  return <div className={`page-shell ${opened ? 'is-open' : ''}`}>
    <audio ref={audioRef} src={data.music.file} autoPlay preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <header className="music-bar"><motion.div className={`vinyl ${playing ? 'is-playing' : ''}`} animate={{ rotate: playing ? 360 : 0 }} transition={playing ? { repeat: Infinity, duration: 9, ease: 'linear' } : { duration: .35 }}><span /><i /></motion.div><div className="track-copy"><small>♪</small><strong>{data.music.title}</strong><em>{data.music.artist}</em></div><motion.button className={`icon-button ${playing ? 'is-active' : ''}`} onClick={toggleAudio} whileTap={{ scale: .88 }} aria-label={playing ? 'Pause music' : 'Play music'}>{playing ? <span className="pause-icon"><PauseIcon /></span> : <span className="play-icon" aria-hidden="true" />}<span className="sound-wave" aria-hidden="true"><i /><i /><i /></span></motion.button></header>
    <main>
      <section className="hero full-section"><div className="rings" /><Reveal className="hero-content"><p className="eyebrow">THE WEDDING CELEBRATION OF</p><div className="monogram">{data.couple.monogram}<b>✦</b></div><h1><span>{data.couple.name1}</span><i>&amp;</i><span>{data.couple.name2}</span></h1><p className="date-line">{data.wedding.displayDate}</p><motion.div className="hero-image image-frame" whileHover={{ scale: 1.025, rotate: -0.4 }}><img src={data.images.hero} alt="Vandesh and Komal wedding invitation" /><div className="hero-card"><small>SAVE THE DATE</small><em>An Invitation to</em><strong>Our Wedding</strong></div><div className="seal">{data.couple.sealMonogram}</div></motion.div><motion.button className="open-button" onClick={openInvitation} whileTap={{ scale: .96 }} whileHover={{ y: -3 }}>TAP TO OPEN INVITATION <span className="open-arrow" aria-hidden="true">↓</span></motion.button></Reveal></section>
      <AnimatePresence>{opened && <motion.div className="invitation-pages" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}>
        <section id="introduction" className="full-section introduction"><Reveal className="letter paper"><small>A LETTER FROM OUR HEARTS</small><h2>DEAR FAMILY &amp; FRIENDS</h2><div className="ornament">❦</div><p>Because you have believed in us, celebrated with us, and enriched our lives with your generous love, we joyfully invite you to witness and celebrate our union.</p><span>TOGETHER WITH THEIR FAMILIES</span><strong>{data.couple.displayName}</strong></Reveal></section>
        <section className="full-section story"><Reveal className="section-inner"><small className="eyebrow">{data.story.eyebrow}</small><h2>{data.story.sectionTitle}</h2><motion.div className="story-image image-frame" whileHover={{ scale: 1.02 }}><img src={data.images.story} alt="Vandesh and Komal" /></motion.div><p>{data.story.body}</p><div className="story-signoff"><span /><em>Until the end of time</em><span /></div></Reveal></section>
        <section className="full-section calendar"><WeddingCalendar data={data} countdown={countdown} onDownload={downloadCalendar} /></section>
        <section className="full-section venue"><Reveal className="section-inner"><small className="eyebrow">THE SETTING</small><h2>CEREMONY &amp; VENUE</h2><motion.div className="venue-image image-frame" whileHover={{ scale: 1.02 }}><img src={data.images.venue} alt={data.venue.name} /></motion.div><h3>{data.venue.name}</h3><p>{data.venue.city.toUpperCase()}</p><small>{data.venue.address}</small><div className="action-row"><a className="venue-map-link" href={data.venue.mapsUrl} target="_blank" rel="noreferrer">OPEN IN MAPS <MapArrow /></a><button onClick={copyAddress}>COPY ADDRESS</button></div></Reveal></section>
        <section className="full-section timeline"><Reveal className="section-inner"><small className="eyebrow" style={timelineType.label}>ORDER OF EVENTS</small><h2 style={timelineType.heading}>WEDDING TIMELINE</h2><div className="timeline-breeze-list" style={{ position: 'relative', width: 'min(100%, 320px)', margin: '25px auto 0', paddingLeft: '40px', borderLeft: '1px solid #c5a88099', textAlign: 'left' }}>{data.events.map((event, index) => <motion.article key={event.id} className="timeline-breeze-event" style={{ '--breeze-delay': `${index * 0.32}s`, position: 'relative', paddingBottom: '25px' }} whileHover={{ y: -4 }} whileTap={{ scale: .98 }} transition={transition}><span aria-hidden="true" className="timeline-breeze-node" style={{ position: 'absolute', left: '-57px', top: 0, display: 'grid', placeItems: 'center', width: '30px', height: '30px', border: '1px solid #c5a880', borderRadius: '50%', background: '#fffdf8', color: '#b38e5d', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', boxShadow: '0 3px 8px #3c302012' }}>❦</span><div className="timeline-breeze-content"><small style={timelineType.time}>{event.displayDate} · {event.time}</small><h3 style={{ ...timelineType.title, margin: '4px 0 2px', fontSize: '20px' }}>{event.name}</h3><p style={{ ...timelineType.detail, margin: 0 }}>{event.location}</p>{event.id === 'haldi' && event.mapsUrl && <a className="timeline-map-link" style={{ ...timelineType.link, display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '7px', fontSize: '8px' }} href={event.mapsUrl} target="_blank" rel="noreferrer">OPEN IN MAPS <MapArrow /></a>}</div></motion.article>)}</div></Reveal></section>
        <section className="full-section footer"><Reveal className="section-inner"><motion.div className="footer-image image-frame" whileHover={{ scale: 1.02 }}><img src={data.images.footer} alt={data.couple.displayName} /></motion.div><h2>Thank You</h2><p>WE CANNOT WAIT TO CELEBRATE WITH YOU</p></Reveal></section>
      </motion.div>}</AnimatePresence>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<><App /><Analytics /></>);
