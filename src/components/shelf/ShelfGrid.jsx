import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Package, Trash2 } from 'lucide-react';

export default function ShelfGrid({ 
  rows, 
  columns, 
  positions, 
  toners, 
  highlightTonerId,
  highlightTonerIds = [], 
  onCellClick,
  editable = false,
  cabinetName
}) {
  const getPositionData = (row, col) => {
    return positions.find(p => p.row === row && p.column === col);
  };

  const getTonerForPosition = (position) => {
    if (!position?.toner_id) return null;
    return toners.find(t => t.id === position.toner_id);
  };

  const getTonerColor = (toner) => {
    if (!toner) return 'bg-slate-600';
    const colors = {
      schwarz: 'bg-slate-800',
      cyan: 'bg-cyan-500',
      magenta: 'bg-pink-500',
      gelb: 'bg-yellow-400',
      resttonerbehälter: 'bg-emerald-600'
    };
    return colors[toner.color] || 'bg-slate-400';
  };

  return (
    <div className="relative">
      {/* Schrank-Rahmen */}
      <div className="bg-gradient-to-b from-slate-600 to-slate-700 p-3 rounded-xl shadow-2xl">
        {cabinetName && (
          <div className="text-center text-white text-sm font-medium mb-2 opacity-80">
            {cabinetName}
          </div>
        )}
        <div className="bg-slate-800/50 rounded-lg p-2 overflow-x-auto">
          <div 
            className="grid gap-2"
            style={{ gridTemplateRows: `repeat(${rows}, 1fr)`, minWidth: `${columns * 70}px` }}
          >
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={rowIndex}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(60px, 1fr))` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const position = getPositionData(rowIndex, colIndex);
                  const toner = getTonerForPosition(position);
                  const isHighlighted = (highlightTonerId && toner?.id === highlightTonerId) || 
                    (highlightTonerIds.length > 0 && highlightTonerIds.includes(toner?.id));

                  return (
                    <motion.button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => onCellClick?.(rowIndex, colIndex, position)}
                      disabled={!editable && !onCellClick}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: isHighlighted ? [1, 1.05, 1] : 1,
                        boxShadow: isHighlighted ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none'
                      }}
                      transition={{ 
                        repeat: isHighlighted ? Infinity : 0, 
                        duration: 1.5 
                      }}
                      className={cn(
                        "aspect-square min-h-[60px] rounded-lg border-2 transition-all duration-200",
                        "flex flex-col items-center justify-center p-1",
                        editable && "cursor-pointer hover:border-slate-400",
                        !editable && !toner && "cursor-default",
                        toner ? "border-slate-500/50 bg-slate-200" : "border-slate-600/50 bg-slate-700/50",
                        isHighlighted && "ring-4 ring-green-400 border-green-500 bg-green-50"
                      )}
                    >
                      {toner ? (
                        <>
                          {toner.image_url ? (
                            <img 
                              src={toner.image_url} 
                              alt={toner.model} 
                              className="w-10 h-10 rounded-md object-cover mb-1"
                            />
                          ) : (
                            <div className={cn(
                              "w-8 h-8 rounded-md flex items-center justify-center mb-1",
                              getTonerColor(toner)
                            )}>
                              {toner.color === 'resttonerbehälter' ? (
                                <Trash2 className="w-5 h-5 text-white" />
                              ) : (
                                <Package className={cn(
                                  "w-5 h-5",
                                  toner.color === 'gelb' ? 'text-amber-900' : 'text-white'
                                )} />
                              )}
                            </div>
                          )}
                          <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">
                            {toner.model}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {editable ? '+' : ''}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Schrank-Füße */}
      <div className="flex justify-between px-4 -mt-1">
        <div className="w-8 h-4 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-lg" />
        <div className="w-8 h-4 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-lg" />
      </div>
    </div>
  );
}