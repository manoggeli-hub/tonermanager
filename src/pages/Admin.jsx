import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Package, Printer, Grid3X3, Plus, Trash2, 
  Save, Loader2, ChevronRight, X, Edit
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShelfGrid from '@/components/shelf/ShelfGrid';
import { cn } from "@/lib/utils";

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('shelf');
  const [selectedCell, setSelectedCell] = useState(null);
  const [showTonerDialog, setShowTonerDialog] = useState(false);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [editingToner, setEditingToner] = useState(null);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [newToner, setNewToner] = useState({ model: '', name: '', color: 'schwarz', stock: 0 });
  const [newPrinter, setNewPrinter] = useState({ name: '', model: '', toner_id: '' });

  const { data: toners = [], isLoading: loadingToners } = useQuery({
    queryKey: ['toners'],
    queryFn: () => base44.entities.Toner.list()
  });

  const { data: printers = [], isLoading: loadingPrinters } = useQuery({
    queryKey: ['printers'],
    queryFn: () => base44.entities.Printer.list()
  });

  const { data: shelfConfigs = [] } = useQuery({
    queryKey: ['shelfConfig'],
    queryFn: () => base44.entities.ShelfConfig.list()
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => base44.entities.ShelfPosition.list()
  });

  const shelfConfig = shelfConfigs[0] || { rows: 4, columns: 6 };

  // Mutations
  const createTonerMutation = useMutation({
    mutationFn: (data) => base44.entities.Toner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toners'] });
      setShowTonerDialog(false);
      setNewToner({ model: '', name: '', color: 'schwarz', stock: 0 });
    }
  });

  const updateTonerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Toner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toners'] });
      setEditingToner(null);
    }
  });

  const deleteTonerMutation = useMutation({
    mutationFn: (id) => base44.entities.Toner.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['toners'] })
  });

  const createPrinterMutation = useMutation({
    mutationFn: (data) => base44.entities.Printer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      setShowPrinterDialog(false);
      setNewPrinter({ name: '', model: '', toner_id: '' });
    }
  });

  const updatePrinterMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Printer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      setEditingPrinter(null);
    }
  });

  const deletePrinterMutation = useMutation({
    mutationFn: (id) => base44.entities.Printer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['printers'] })
  });

  const updateShelfConfigMutation = useMutation({
    mutationFn: async (data) => {
      if (shelfConfigs[0]) {
        return base44.entities.ShelfConfig.update(shelfConfigs[0].id, data);
      }
      return base44.entities.ShelfConfig.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelfConfig'] })
  });

  const updatePositionMutation = useMutation({
    mutationFn: async ({ row, column, toner_id }) => {
      const existing = positions.find(p => p.row === row && p.column === column);
      if (existing) {
        if (toner_id) {
          return base44.entities.ShelfPosition.update(existing.id, { toner_id });
        } else {
          return base44.entities.ShelfPosition.delete(existing.id);
        }
      } else if (toner_id) {
        return base44.entities.ShelfPosition.create({ row, column, toner_id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setSelectedCell(null);
    }
  });

  const handleCellClick = (row, column, position) => {
    setSelectedCell({ row, column, position, toner_id: position?.toner_id || '' });
  };

  if (loadingToners || loadingPrinters) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin-Bereich</h1>
            <p className="text-slate-500">Toner & Regal verwalten</p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="shelf" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Regal
            </TabsTrigger>
            <TabsTrigger value="toners" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Toner
            </TabsTrigger>
            <TabsTrigger value="printers" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Drucker
            </TabsTrigger>
          </TabsList>

          {/* Regal Tab */}
          <TabsContent value="shelf" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regal-Konfiguration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reihen</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={shelfConfig.rows}
                      onChange={(e) => updateShelfConfigMutation.mutate({ 
                        ...shelfConfig, 
                        rows: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                  <div>
                    <Label>Fächer pro Reihe</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={shelfConfig.columns}
                      onChange={(e) => updateShelfConfigMutation.mutate({ 
                        ...shelfConfig, 
                        columns: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Toner-Positionen festlegen</CardTitle>
                <p className="text-sm text-slate-500">Klicke auf ein Fach, um einen Toner zuzuweisen</p>
              </CardHeader>
              <CardContent>
                <ShelfGrid
                  rows={shelfConfig.rows}
                  columns={shelfConfig.columns}
                  positions={positions}
                  toners={toners}
                  onCellClick={handleCellClick}
                  editable
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Toner Tab */}
          <TabsContent value="toners" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Toner-Modelle</h2>
              <Button onClick={() => setShowTonerDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neuer Toner
              </Button>
            </div>

            <div className="space-y-2">
              {toners.map((toner) => (
                <motion.div
                  key={toner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    toner.color === 'schwarz' && "bg-slate-800",
                    toner.color === 'cyan' && "bg-cyan-500",
                    toner.color === 'magenta' && "bg-pink-500",
                    toner.color === 'gelb' && "bg-yellow-400"
                  )}>
                    <Package className={cn(
                      "w-5 h-5",
                      toner.color === 'gelb' ? 'text-amber-900' : 'text-white'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{toner.model}</div>
                    <div className="text-sm text-slate-500">{toner.name}</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Bestand: {toner.stock || 0}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditingToner(toner)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteTonerMutation.mutate(toner.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </motion.div>
              ))}

              {toners.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Toner angelegt</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Drucker Tab */}
          <TabsContent value="printers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Drucker</h2>
              <Button onClick={() => setShowPrinterDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neuer Drucker
              </Button>
            </div>

            <div className="space-y-2">
              {printers.map((printer) => {
                const assignedToner = toners.find(t => t.id === printer.toner_id);
                return (
                  <motion.div
                    key={printer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Printer className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{printer.name}</div>
                      <div className="text-sm text-slate-500">{printer.model}</div>
                    </div>
                    {assignedToner && (
                      <div className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                        {assignedToner.model}
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setEditingPrinter(printer)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deletePrinterMutation.mutate(printer.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </motion.div>
                );
              })}

              {printers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Drucker angelegt</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Cell Assignment Dialog */}
        <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Fach {selectedCell && `${String.fromCharCode(65 + selectedCell.row)}${selectedCell.column + 1}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Toner zuweisen</Label>
                <Select
                  value={selectedCell?.toner_id || 'none'}
                  onValueChange={(value) => setSelectedCell({
                    ...selectedCell,
                    toner_id: value === 'none' ? '' : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toner auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Toner</SelectItem>
                    {toners.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.model} - {t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCell(null)}>Abbrechen</Button>
              <Button 
                onClick={() => updatePositionMutation.mutate({
                  row: selectedCell.row,
                  column: selectedCell.column,
                  toner_id: selectedCell.toner_id
                })}
                disabled={updatePositionMutation.isPending}
              >
                {updatePositionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Toner Dialog */}
        <Dialog open={showTonerDialog} onOpenChange={setShowTonerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Toner anlegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Modell/Artikelnummer</Label>
                <Input
                  value={newToner.model}
                  onChange={(e) => setNewToner({...newToner, model: e.target.value})}
                  placeholder="z.B. TN-2420"
                />
              </div>
              <div>
                <Label>Bezeichnung</Label>
                <Input
                  value={newToner.name}
                  onChange={(e) => setNewToner({...newToner, name: e.target.value})}
                  placeholder="z.B. Brother Toner schwarz"
                />
              </div>
              <div>
                <Label>Farbe</Label>
                <Select
                  value={newToner.color}
                  onValueChange={(value) => setNewToner({...newToner, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schwarz">Schwarz</SelectItem>
                    <SelectItem value="cyan">Cyan</SelectItem>
                    <SelectItem value="magenta">Magenta</SelectItem>
                    <SelectItem value="gelb">Gelb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bestand</Label>
                <Input
                  type="number"
                  min={0}
                  value={newToner.stock}
                  onChange={(e) => setNewToner({...newToner, stock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTonerDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createTonerMutation.mutate(newToner)}
                disabled={!newToner.model || createTonerMutation.isPending}
              >
                {createTonerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Toner Dialog */}
        <Dialog open={!!editingToner} onOpenChange={() => setEditingToner(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Toner bearbeiten</DialogTitle>
            </DialogHeader>
            {editingToner && (
              <div className="space-y-4">
                <div>
                  <Label>Modell/Artikelnummer</Label>
                  <Input
                    value={editingToner.model}
                    onChange={(e) => setEditingToner({...editingToner, model: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Bezeichnung</Label>
                  <Input
                    value={editingToner.name}
                    onChange={(e) => setEditingToner({...editingToner, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Farbe</Label>
                  <Select
                    value={editingToner.color}
                    onValueChange={(value) => setEditingToner({...editingToner, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schwarz">Schwarz</SelectItem>
                      <SelectItem value="cyan">Cyan</SelectItem>
                      <SelectItem value="magenta">Magenta</SelectItem>
                      <SelectItem value="gelb">Gelb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bestand</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingToner.stock || 0}
                    onChange={(e) => setEditingToner({...editingToner, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingToner(null)}>Abbrechen</Button>
              <Button 
                onClick={() => updateTonerMutation.mutate({ 
                  id: editingToner.id, 
                  data: { 
                    model: editingToner.model,
                    name: editingToner.name,
                    color: editingToner.color,
                    stock: editingToner.stock
                  }
                })}
                disabled={updateTonerMutation.isPending}
              >
                {updateTonerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Printer Dialog */}
        <Dialog open={showPrinterDialog} onOpenChange={setShowPrinterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Drucker anlegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name/Standort</Label>
                <Input
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
                  placeholder="z.B. Büro 1. OG"
                />
              </div>
              <div>
                <Label>Modell</Label>
                <Input
                  value={newPrinter.model}
                  onChange={(e) => setNewPrinter({...newPrinter, model: e.target.value})}
                  placeholder="z.B. Brother HL-L2350DW"
                />
              </div>
              <div>
                <Label>Toner</Label>
                <Select
                  value={newPrinter.toner_id || 'none'}
                  onValueChange={(value) => setNewPrinter({...newPrinter, toner_id: value === 'none' ? '' : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toner auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Toner</SelectItem>
                    {toners.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.model} - {t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrinterDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createPrinterMutation.mutate(newPrinter)}
                disabled={!newPrinter.name || !newPrinter.model || createPrinterMutation.isPending}
              >
                {createPrinterMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Printer Dialog */}
        <Dialog open={!!editingPrinter} onOpenChange={() => setEditingPrinter(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Drucker bearbeiten</DialogTitle>
            </DialogHeader>
            {editingPrinter && (
              <div className="space-y-4">
                <div>
                  <Label>Name/Standort</Label>
                  <Input
                    value={editingPrinter.name}
                    onChange={(e) => setEditingPrinter({...editingPrinter, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Modell</Label>
                  <Input
                    value={editingPrinter.model}
                    onChange={(e) => setEditingPrinter({...editingPrinter, model: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Toner</Label>
                  <Select
                    value={editingPrinter.toner_id || 'none'}
                    onValueChange={(value) => setEditingPrinter({...editingPrinter, toner_id: value === 'none' ? '' : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toner auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kein Toner</SelectItem>
                      {toners.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.model} - {t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPrinter(null)}>Abbrechen</Button>
              <Button 
                onClick={() => updatePrinterMutation.mutate({ 
                  id: editingPrinter.id, 
                  data: { 
                    name: editingPrinter.name,
                    model: editingPrinter.model,
                    toner_id: editingPrinter.toner_id
                  }
                })}
                disabled={updatePrinterMutation.isPending}
              >
                {updatePrinterMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}