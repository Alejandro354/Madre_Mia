import { useEffect } from "react";

export default function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-10 cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Foto ampliada"
        className="max-w-[min(90vw,480px)] max-h-[80vh] rounded-2xl shadow-2xl object-contain cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
