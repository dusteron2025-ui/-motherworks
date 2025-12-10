"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
    const { users } = useStore();

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Usuários</h1>
                    <p className="text-slate-500">Gerencie todos os clientes e provedores.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                        <Download className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                    <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
                        Adicionar Novo
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] bg-white rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Buscar por nome ou email..." className="pl-10 h-12 rounded-2xl bg-slate-50 border-none" />
                    </div>
                    <Button variant="ghost" className="rounded-xl text-slate-500">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-6 h-12 text-slate-400 font-medium">Usuário</TableHead>
                                <TableHead className="h-12 text-slate-400 font-medium">Email</TableHead>
                                <TableHead className="h-12 text-slate-400 font-medium">Papel</TableHead>
                                <TableHead className="h-12 text-slate-400 font-medium">Status</TableHead>
                                <TableHead className="h-12 text-slate-400 font-medium">Data Cadastro</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 py-4 font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{user.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-slate-700 font-semibold">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-lg px-3 py-1 font-medium border-none ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                                                user.role === 'PROVIDER' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                                                    'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                            }`}>
                                            {user.role === 'ADMIN' ? 'Administrador' : user.role === 'PROVIDER' ? 'Profissional' : 'Cliente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                            Ativo
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
