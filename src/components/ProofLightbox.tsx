import React from 'react';
import { X } from 'lucide-react';

interface ProofLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export const ProofLightbox: React.FC<ProofLightboxProps> = ({
  isOpen,
  imageUrl,
  title,
  onClose,
}) => {
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 190);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`proof-lightbox-backdrop fixed inset-0 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto ${
        isClosing ? 'tv-closing-backdrop' : ''
      }`}
      onClick={handleClose}
    >
      <div
        className={`proof-lightbox-modal relative max-w-5xl w-full bg-[#121316] border-[2px] border-[#2A2C3C] rounded-[22px] shadow-[0_25px_65px_rgba(0,0,0,0.95)] p-4 sm:p-5 overflow-hidden flex flex-col my-auto ${
          isClosing ? 'tv-closing' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#1E2028]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFDE00] shrink-0" />
            <h3 className="font-['Outfit'] text-base sm:text-lg font-black uppercase italic tracking-tight text-white truncate">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full border border-[#2B2D38] bg-[#181920] text-zinc-400 hover:text-white hover:border-[#4C5066] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0A0B0E] flex items-center justify-center border border-[#222432]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </div>
      </div>
    </div>
  );
};
