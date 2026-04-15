import React from 'react';
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
      <div className="bg-gradient-to-b from-slate-600 to-slate-700 p-2 rounded-lg shadow-xl">
        {cabinetName && (
          <div className="text-center text-white text-xs font-medium mb-1 opacity-80">
            {cabinetName}
          </div>
        )}
        <div className="bg-slate-800/50 rounded-md p-1.5 overflow-x-auto">
          <div 
            className="grid gap-1.5"
            style={{ gridTemplateRows: `repeat(${rows}, 1fr)`, minWidth: `${columns * 50}px` }}
          >
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={rowIndex}
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(45px, 1fr))` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const position = getPositionData(rowIndex, colIndex);
                  const toner = getTonerForPosition(position);
                  const isHighlighted = (highlightTonerId && toner?.id === highlightTonerId) || 
                    (highlightTonerIds.length > 0 && highlightTonerIds.includes(toner?.id));

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => onCellClick?.(rowIndex, colIndex, position)}
                      disabled={!editable && !onCellClick}
                      className={cn(
                        "aspect-square min-h-[45px] rounded-md border transition-all duration-200",
                        "flex flex-col items-center justify-center p-0.5",
                        editable && "cursor-pointer hover:border-slate-400",
                        !editable && !toner && "cursor-default",
                        toner ? "border-slate-500/50 bg-slate-200" : "border-slate-600/50 bg-slate-700/50",
                        isHighlighted && "ring-2 ring-green-400 border-green-500 bg-green-50 animate-pulse"
                      )}
                      >
                      {toner ? (
                      <>
                      {toner.image_url ? (
                      <img 
                        src={toner.image_url} 
                        alt={toner.model} 
                        className="w-7 h-7 rounded object-cover mb-0.5"
                      />
                      ) : (
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center mb-0.5",
                        getTonerColor(toner)
                      )}>
                        {toner.color === 'resttonerbehälter' ? (
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Package className={cn(
                            "w-3.5 h-3.5",
                            toner.color === 'gelb' ? 'text-amber-900' : 'text-white'
                          )} />
                        )}
                      </div>
                      )}
                      <span className="text-[9px] font-medium text-slate-700 truncate w-full text-center px-0.5">
                      {toner.model}
                      </span>
                      </>
                      ) : (
                      <span className="text-xs text-slate-400">
                      {editable ? '+' : ''}
                      </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Schrank-Füße */}
      <div className="flex justify-between px-3 -mt-0.5">
        <div className="w-6 h-3 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-md" />
        <div className="w-6 h-3 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-md" />
      </div>
    </div>
  );
}