import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Settings, Package, Printer, Grid3X3, Plus, Trash2, 
  Loader2, Edit, Building2, Cpu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShelfGrid from '@/components/shelf/ShelfGrid';
import ImageUpload from '@/components/common/ImageUpload';
import { cn } from "@/lib/utils";

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('shelf');
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Dialog states
  const [showTonerDialog, setShowTonerDialog] = useState(false);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [showManufacturerDialog, setShowManufacturerDialog] = useState(false);
  const [showPrinterModelDialog, setShowPrinterModelDialog] = useState(false);
  
  // Edit states
  const [editingToner, setEditingToner] = useState(null);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [editingPrinterModel, setEditingPrinterModel] = useState(null);
  
  // New entity states
  const [newToner, setNewToner] = useState({ model: '', name: '', color: 'schwarz', stock: 0, image_url: '' });
  const [newPrinter, setNewPrinter] = useState({ name: '', printer_model_id: '' });
  const [newManufacturer, setNewManufacturer] = useState({ name: '' });
  const [newPrinterModel, setNewPrinterModel] = useState({ name: '', manufacturer_id: '', toner_ids: [], image_url: '' });

  // Queries
  const { data: toners = [], isLoading: loadingToners } = useQuery({
    queryKey: ['toners'],
    queryFn: () => base44.entities.Toner.list()
  });

  const { data: printers = [], isLoading: loadingPrinters } = useQuery({
    queryKey: ['printers'],
    queryFn: () => base44.entities.Printer.list()
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list()
  });

  const { data: printerModels = [] } = useQuery({
    queryKey: ['printerModels'],
    queryFn: () => base44.entities.PrinterModel.list()
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

  // Toner Mutations
  const createTonerMutation = useMutation({
    mutationFn: (data) => base44.entities.Toner.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toners'] });
      setShowTonerDialog(false);
      setNewToner({ model: '', name: '', color: 'schwarz', stock: 0, image_url: '' });
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

  // Manufacturer Mutations
  const createManufacturerMutation = useMutation({
    mutationFn: (data) => base44.entities.Manufacturer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      setShowManufacturerDialog(false);
      setNewManufacturer({ name: '' });
    }
  });

  const updateManufacturerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Manufacturer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      setEditingManufacturer(null);
    }
  });

  const deleteManufacturerMutation = useMutation({
    mutationFn: (id) => base44.entities.Manufacturer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })
  });

  // PrinterModel Mutations
  const createPrinterModelMutation = useMutation({
    mutationFn: (data) => base44.entities.PrinterModel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printerModels'] });
      setShowPrinterModelDialog(false);
      setNewPrinterModel({ name: '', manufacturer_id: '', toner_ids: [], image_url: '' });
    }
  });

  const updatePrinterModelMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrinterModel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printerModels'] });
      setEditingPrinterModel(null);
    }
  });

  const deletePrinterModelMutation = useMutation({
    mutationFn: (id) => base44.entities.PrinterModel.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['printerModels'] })
  });

  // Printer Mutations
  const createPrinterMutation = useMutation({
    mutationFn: (data) => base44.entities.Printer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      setShowPrinterDialog(false);
      setNewPrinter({ name: '', printer_model_id: '' });
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

  // Shelf Mutations
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

  // Helper functions
  const getManufacturerName = (id) => manufacturers.find(m => m.id === id)?.name || '';
  const getTonerName = (id) => {
    const toner = toners.find(t => t.id === id);
    return toner ? `${toner.model} - ${toner.name}` : '';
  };
  const getPrinterModelInfo = (id) => {
    const model = printerModels.find(m => m.id === id);
    if (!model) return { name: '', manufacturer: '' };
    return { 
      name: model.name, 
      manufacturer: getManufacturerName(model.manufacturer_id)
    };
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
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
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
            <p className="text-slate-500">Toner, Drucker & Regal verwalten</p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="shelf" className="flex items-center gap-1 text-xs">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Regal</span>
            </TabsTrigger>
            <TabsTrigger value="manufacturers" className="flex items-center gap-1 text-xs">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hersteller</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-1 text-xs">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Modelle</span>
            </TabsTrigger>
            <TabsTrigger value="toners" className="flex items-center gap-1 text-xs">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Toner</span>
            </TabsTrigger>
            <TabsTrigger value="printers" className="flex items-center gap-1 text-xs">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Drucker</span>
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

          {/* Hersteller Tab */}
          <TabsContent value="manufacturers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Hersteller</h2>
              <Button onClick={() => setShowManufacturerDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neuer Hersteller
              </Button>
            </div>

            <div className="space-y-2">
              {manufacturers.map((manufacturer) => {
                const modelCount = printerModels.filter(m => m.manufacturer_id === manufacturer.id).length;
                return (
                  <motion.div
                    key={manufacturer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{manufacturer.name}</div>
                      <div className="text-sm text-slate-500">{modelCount} Modell(e)</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingManufacturer(manufacturer)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteManufacturerMutation.mutate(manufacturer.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </motion.div>
                );
              })}

              {manufacturers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Hersteller angelegt</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Drucker-Modelle Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Drucker-Modelle</h2>
              <Button onClick={() => setShowPrinterModelDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neues Modell
              </Button>
            </div>

            <div className="space-y-2">
              {manufacturers.map((manufacturer) => {
                const models = printerModels.filter(m => m.manufacturer_id === manufacturer.id);
                if (models.length === 0) return null;
                
                return (
                  <div key={manufacturer.id} className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-500 mt-4">{manufacturer.name}</h3>
                    {models.map((model) => {
                      const modelToners = (model.toner_ids || []).map(id => toners.find(t => t.id === id)).filter(Boolean);
                      return (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4"
                        >
                          {model.image_url ? (
                            <img src={model.image_url} alt={model.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Cpu className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{model.name}</div>
                            {modelToners.length > 0 && (
                              <div className="text-sm text-slate-500">
                                Toner: {modelToners.map(t => t.model).join(', ')}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setEditingPrinterModel(model)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePrinterModelMutation.mutate(model.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}

              {printerModels.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Drucker-Modelle angelegt</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Toner Tab */}
          <TabsContent value="toners" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Toner</h2>
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
                  {toner.image_url ? (
                    <img src={toner.image_url} alt={toner.model} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
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
                  )}
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
                  <Button variant="ghost" size="icon" onClick={() => deleteTonerMutation.mutate(toner.id)}>
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
              <h2 className="text-lg font-semibold">Drucker (Standorte)</h2>
              <Button onClick={() => setShowPrinterDialog(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neuer Drucker
              </Button>
            </div>

            <div className="space-y-2">
              {printers.map((printer) => {
                const modelInfo = getPrinterModelInfo(printer.printer_model_id);
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
                      <div className="text-sm text-slate-500">
                        {modelInfo.manufacturer} {modelInfo.name}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPrinter(printer)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePrinterMutation.mutate(printer.id)}>
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

        {/* New Manufacturer Dialog */}
        <Dialog open={showManufacturerDialog} onOpenChange={setShowManufacturerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Hersteller anlegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newManufacturer.name}
                  onChange={(e) => setNewManufacturer({...newManufacturer, name: e.target.value})}
                  placeholder="z.B. Brother, HP, Canon"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManufacturerDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createManufacturerMutation.mutate(newManufacturer)}
                disabled={!newManufacturer.name || createManufacturerMutation.isPending}
              >
                {createManufacturerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Manufacturer Dialog */}
        <Dialog open={!!editingManufacturer} onOpenChange={() => setEditingManufacturer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hersteller bearbeiten</DialogTitle>
            </DialogHeader>
            {editingManufacturer && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingManufacturer.name}
                    onChange={(e) => setEditingManufacturer({...editingManufacturer, name: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingManufacturer(null)}>Abbrechen</Button>
              <Button 
                onClick={() => updateManufacturerMutation.mutate({ 
                  id: editingManufacturer.id, 
                  data: { name: editingManufacturer.name }
                })}
                disabled={updateManufacturerMutation.isPending}
              >
                {updateManufacturerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New PrinterModel Dialog */}
        <Dialog open={showPrinterModelDialog} onOpenChange={setShowPrinterModelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Drucker-Modell anlegen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Hersteller</Label>
                <Select
                  value={newPrinterModel.manufacturer_id || ''}
                  onValueChange={(value) => setNewPrinterModel({...newPrinterModel, manufacturer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hersteller auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modellname</Label>
                <Input
                  value={newPrinterModel.name}
                  onChange={(e) => setNewPrinterModel({...newPrinterModel, name: e.target.value})}
                  placeholder="z.B. HL-L2370DN"
                />
              </div>
              <div>
                <Label>Benötigte Toner</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {toners.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={newPrinterModel.toner_ids?.includes(t.id)}
                        onChange={(e) => {
                          const ids = newPrinterModel.toner_ids || [];
                          if (e.target.checked) {
                            setNewPrinterModel({...newPrinterModel, toner_ids: [...ids, t.id]});
                          } else {
                            setNewPrinterModel({...newPrinterModel, toner_ids: ids.filter(id => id !== t.id)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{t.model} - {t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Bild</Label>
                <ImageUpload
                  value={newPrinterModel.image_url}
                  onChange={(url) => setNewPrinterModel({...newPrinterModel, image_url: url})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrinterModelDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createPrinterModelMutation.mutate(newPrinterModel)}
                disabled={!newPrinterModel.name || !newPrinterModel.manufacturer_id || createPrinterModelMutation.isPending}
              >
                {createPrinterModelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit PrinterModel Dialog */}
        <Dialog open={!!editingPrinterModel} onOpenChange={() => setEditingPrinterModel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Drucker-Modell bearbeiten</DialogTitle>
            </DialogHeader>
            {editingPrinterModel && (
              <div className="space-y-4">
                <div>
                  <Label>Hersteller</Label>
                  <Select
                    value={editingPrinterModel.manufacturer_id || ''}
                    onValueChange={(value) => setEditingPrinterModel({...editingPrinterModel, manufacturer_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hersteller auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modellname</Label>
                  <Input
                    value={editingPrinterModel.name}
                    onChange={(e) => setEditingPrinterModel({...editingPrinterModel, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Benötigte Toner</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {toners.map(t => (
                      <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={(editingPrinterModel.toner_ids || []).includes(t.id)}
                          onChange={(e) => {
                            const ids = editingPrinterModel.toner_ids || [];
                            if (e.target.checked) {
                              setEditingPrinterModel({...editingPrinterModel, toner_ids: [...ids, t.id]});
                            } else {
                              setEditingPrinterModel({...editingPrinterModel, toner_ids: ids.filter(id => id !== t.id)});
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{t.model} - {t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Bild</Label>
                  <ImageUpload
                    value={editingPrinterModel.image_url}
                    onChange={(url) => setEditingPrinterModel({...editingPrinterModel, image_url: url})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPrinterModel(null)}>Abbrechen</Button>
              <Button 
                onClick={() => updatePrinterModelMutation.mutate({ 
                  id: editingPrinterModel.id, 
                  data: { 
                    name: editingPrinterModel.name,
                    manufacturer_id: editingPrinterModel.manufacturer_id,
                    toner_ids: editingPrinterModel.toner_ids,
                    image_url: editingPrinterModel.image_url
                  }
                })}
                disabled={updatePrinterModelMutation.isPending}
              >
                {updatePrinterModelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              <div>
                <Label>Bild</Label>
                <ImageUpload
                  value={newToner.image_url}
                  onChange={(url) => setNewToner({...newToner, image_url: url})}
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
                <div>
                  <Label>Bild</Label>
                  <ImageUpload
                    value={editingToner.image_url}
                    onChange={(url) => setEditingToner({...editingToner, image_url: url})}
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
                    stock: editingToner.stock,
                    image_url: editingToner.image_url
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
                <Label>Drucker-Modell</Label>
                <Select
                  value={newPrinter.printer_model_id || ''}
                  onValueChange={(value) => setNewPrinter({...newPrinter, printer_model_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Modell auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map(m => {
                      const models = printerModels.filter(pm => pm.manufacturer_id === m.id);
                      if (models.length === 0) return null;
                      return (
                        <React.Fragment key={m.id}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">{m.name}</div>
                          {models.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrinterDialog(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createPrinterMutation.mutate(newPrinter)}
                disabled={!newPrinter.name || !newPrinter.printer_model_id || createPrinterMutation.isPending}
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
                  <Label>Drucker-Modell</Label>
                  <Select
                    value={editingPrinter.printer_model_id || ''}
                    onValueChange={(value) => setEditingPrinter({...editingPrinter, printer_model_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Modell auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(m => {
                        const models = printerModels.filter(pm => pm.manufacturer_id === m.id);
                        if (models.length === 0) return null;
                        return (
                          <React.Fragment key={m.id}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">{m.name}</div>
                            {models.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </React.Fragment>
                        );
                      })}
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
                    printer_model_id: editingPrinter.printer_model_id
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