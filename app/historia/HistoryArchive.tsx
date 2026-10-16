"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ArchiveCategory = "historiques" | "inicis" | "actuals";
type ArchivePhoto = { file: string; width: number; height: number; category: string };

const categories: { id: ArchiveCategory; label: string }[] = [
  { id: "historiques", label: "Històriques" },
  { id: "inicis", label: "Inicis" },
  { id: "actuals", label: "Actuals" },
];

export function HistoryArchive({ photos, thumbBase, fullBase }: {
  photos: ArchivePhoto[];
  thumbBase: string;
  fullBase: string;
}) {
  const [category, setCategory] = useState<ArchiveCategory | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const visible = useMemo(
    () => (category === null ? photos : photos.filter((photo) => photo.category === category)),
    [category, photos],
  );
  const open = openIndex !== null ? visible[openIndex] : null;

  const close = useCallback(() => {
    setOpenIndex(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback((delta: number) => {
    setOpenIndex((index) => index === null ? index : (index + delta + visible.length) % visible.length);
  }, [visible.length]);

  useEffect(() => {
    if (openIndex === null) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [close, openIndex, step]);

  return (
    <div className="albumViewer">
      <nav className="albumFilter" aria-label="Classifica les fotografies">
        <button type="button" className={category === null ? "isActive" : ""} aria-pressed={category === null} onClick={() => { setCategory(null); setOpenIndex(null); }}>
          Totes <small>{photos.length}</small>
        </button>
        {categories.map(({ id, label }) => (
          <button key={id} type="button" className={category === id ? "isActive" : ""} aria-pressed={category === id} onClick={() => { setCategory(id); setOpenIndex(null); }}>
            {label} <small>{photos.filter((photo) => photo.category === id).length}</small>
          </button>
        ))}
      </nav>

      <ul className="albumGrid">
        {visible.map((photo, index) => (
          <li key={photo.file}>
            <button type="button" aria-label={`Amplia la fotografia ${index + 1}`} onClick={(event) => { lastTrigger.current = event.currentTarget; setOpenIndex(index); }}>
              <Image src={`${thumbBase}${photo.file}`} alt="" width={720} height={540} sizes="(max-width: 620px) 45vw, (max-width: 1100px) 30vw, 22vw" />
            </button>
          </li>
        ))}
      </ul>

      {open ? (
        <div className="albumLightbox">
          <button className="albumBackdrop" type="button" tabIndex={-1} aria-hidden="true" onClick={close} />
          <div className="albumLightboxInner" role="dialog" aria-modal="true" aria-label="Fotografia ampliada" tabIndex={-1} ref={dialogRef}>
            <button className="albumClose" type="button" onClick={close} aria-label="Tanca la imatge">×</button>
            <div className="albumStage">
              <button className="albumNav albumNavPrev" type="button" onClick={() => step(-1)} aria-label="Fotografia anterior">‹</button>
              <Image key={open.file} src={`${fullBase}${open.file}`} alt="" width={open.width} height={open.height} sizes="(max-width: 900px) 96vw, 68vw" />
              <button className="albumNav albumNavNext" type="button" onClick={() => step(1)} aria-label="Fotografia següent">›</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
