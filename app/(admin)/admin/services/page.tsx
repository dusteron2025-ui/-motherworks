"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Sparkles } from "lucide-react";
import { Service } from "@/types";

export default function AdminServicesPage() {
    const { services, addService, updateService, deleteService } = useStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", basePrice: 15, icon: "Sparkles" });

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({ name: service.name, description: service.description, basePrice: service.basePrice, icon: service.icon });
        } else {
            setEditingService(null);
            setFormData({ name: "", description: "", basePrice: 15, icon: "Sparkles" });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        const serviceData: Service = {
            id: editingService ? editingService.id : `svc-${Date.now()}`,
            ...formData
        };

        if (editingService) {
            updateService(serviceData);
        } else {
            addService(serviceData);
        }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Serviços</h1>
                    <p className="text-slate-500">Gerencie os serviços disponíveis na plataforma.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <Card className="border-none shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Preço Base (€/h)</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Sparkles className="h-4 w-4 text-slate-500" />
                                        </div>
                                        {service.name}
                                    </TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>€{service.basePrice}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                                            <Edit className="h-4 w-4 text-slate-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Serviço</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Preço Base (€/h)</Label>
                            <Input type="number" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
