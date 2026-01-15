import React from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TonerCard({ toner, position, isHighlighted }) {
  const getTonerColor = () => {
    const colors = {
      schwarz: 'from-slate-700 to-slate-900',
      cyan: 'from-cyan-400 to-cyan-600',
      magenta: 'from-pink-400 to-pink-600',
      gelb: 'from-yellow-300 to-yellow-500'
    };
    return colors[toner?.color] || 'from-slate-400 to-slate-600';
  };

  const getTextColor = () => {
    return toner?.color === 'gelb' ? 'text-amber-900' : 'text-white';
  };

  if (!toner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-6 bg-gradient-to-br shadow-xl",
        getTonerColor(),
        isHighlighted && "ring-4 ring-green-400"
      )}
    >
      <div className={cn("flex items-start justify-between", getTextColor())}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-6 h-6" />
            <span className="text-sm font-medium opacity-80">Toner</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{toner.model}</h3>
          <p className="text-sm opacity-80">{toner.name}</p>
        </div>
        
        {position && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <MapPin className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs opacity-80">Regal</div>
            <div className="text-lg font-bold">
              {String.fromCharCode(65 + position.row)}{position.column + 1}
            </div>
          </div>
        )}
      </div>

      {toner.stock !== undefined && (
        <div className={cn("mt-4 pt-4 border-t border-white/20", getTextColor())}>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Bestand</span>
            <span className="text-xl font-bold">{toner.stock} Stück</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}