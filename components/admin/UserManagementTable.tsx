"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Ban,
    Shield,
    ShieldCheck,
    Clock,
    Star,
    Loader2,
} from 'lucide-react';
import { UserProfile, ProviderProfile } from '@/types';
import { UserStatus, getUserStatus, approveProvider, suspendUser, unsuspendUser, banUser } from '@/services/adminService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserManagementTableProps {
    users: UserProfile[];
    adminId: string;
    onUserUpdate?: () => void;
}

export function UserManagementTable({ users, adminId, onUserUpdate }: UserManagementTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'PROVIDER'>('ALL');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [actionDialog, setActionDialog] = useState<{ type: 'suspend' | 'ban' | 'approve' | null; user: UserProfile | null }>({ type: null, user: null });
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole && user.role !== 'ADMIN';
    });

    const getStatusBadge = (userId: string, user: UserProfile) => {
        const status = getUserStatus(userId);
        const isProvider = user.role === 'PROVIDER';
        const providerVerified = isProvider && (user as ProviderProfile).verifiedStatus;

        if (status === 'BANNED') {
            return <Badge className="bg-red-100 text-red-700 border-none"><Ban className="h-3 w-3 mr-1" />Banido</Badge>;
        }
        if (status === 'SUSPENDED') {
            return <Badge className="bg-amber-100 text-amber-700 border-none"><AlertTriangle className="h-3 w-3 mr-1" />Suspenso</Badge>;
        }
        if (isProvider && !providerVerified) {
            return <Badge className="bg-purple-100 text-purple-700 border-none"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
        }
        return <Badge className="bg-green-100 text-green-700 border-none"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>;
    };

    const handleAction = async (action: 'approve' | 'suspend' | 'unsuspend' | 'ban') => {
        if (!actionDialog.user) return;
        setIsLoading(true);

        try {
            switch (action) {
                case 'approve':
                    approveProvider(adminId, actionDialog.user.id);
                    break;
                case 'suspend':
                    suspendUser(adminId, actionDialog.user.id, reason);
                    break;
                case 'unsuspend':
                    unsuspendUser(adminId, actionDialog.user.id);
                    break;
                case 'ban':
                    banUser(adminId, actionDialog.user.id, reason);
                    break;
            }
            onUserUpdate?.();
        } finally {
            setIsLoading(false);
            setActionDialog({ type: null, user: null });
            setReason('');
        }
    };

    return (
        <>
            <Card className="border-none shadow-lg bg-white rounded-2xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['ALL', 'CLIENT', 'PROVIDER'] as const).map((role) => (
                                <Button
                                    key={role}
                                    variant={roleFilter === role ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRoleFilter(role)}
                                    className={cn(
                                        "rounded-full",
                                        roleFilter === role && "bg-slate-900 hover:bg-slate-800"
                                    )}
                                >
                                    {role === 'ALL' ? 'Todos' : role === 'CLIENT' ? 'Clientes' : 'Provedores'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Cadastro</TableHead>
                                <TableHead className="text-right pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback className="bg-slate-100 font-bold">
                                                    {user.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-slate-900">{user.name}</p>
                                                {user.role === 'PROVIDER' && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                        {(user as ProviderProfile).rating.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "border-none",
                                            user.role === 'PROVIDER' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {user.role === 'PROVIDER' ? 'Provedor' : 'Cliente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.id, user)}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                {user.role === 'PROVIDER' && !(user as ProviderProfile).verifiedStatus && (
                                                    <DropdownMenuItem
                                                        onClick={() => setActionDialog({ type: 'approve', user })}
                                                        className="text-green-600"
                                                    >
                                                        <ShieldCheck className="h-4 w-4 mr-2" />
                                                        Aprovar Provedor
                                                    </DropdownMenuItem>
                                                )}
                                                {getUserStatus(user.id) === 'ACTIVE' && (
                                                    <DropdownMenuItem
                                                        onClick={() => setActionDialog({ type: 'suspend', user })}
                                                        className="text-amber-600"
                                                    >
                                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                                        Suspender
                                                    </DropdownMenuItem>
                                                )}
                                                {getUserStatus(user.id) === 'SUSPENDED' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleAction('unsuspend')}
                                                        className="text-green-600"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Reativar
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setActionDialog({ type: 'ban', user })}
                                                    className="text-red-600"
                                                >
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Banir Usuário
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            Nenhum usuário encontrado
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={!!actionDialog.type} onOpenChange={() => setActionDialog({ type: null, user: null })}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type === 'approve' && 'Aprovar Provedor'}
                            {actionDialog.type === 'suspend' && 'Suspender Usuário'}
                            {actionDialog.type === 'ban' && 'Banir Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.type === 'approve' && `Confirma a aprovação de ${actionDialog.user?.name}?`}
                            {actionDialog.type === 'suspend' && `Suspender temporariamente ${actionDialog.user?.name}?`}
                            {actionDialog.type === 'ban' && `Banir permanentemente ${actionDialog.user?.name}? Esta ação não pode ser desfeita.`}
                        </DialogDescription>
                    </DialogHeader>
                    {(actionDialog.type === 'suspend' || actionDialog.type === 'ban') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Motivo</label>
                            <Textarea
                                placeholder="Descreva o motivo da ação..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setActionDialog({ type: null, user: null })}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => handleAction(actionDialog.type!)}
                            disabled={isLoading || ((actionDialog.type === 'suspend' || actionDialog.type === 'ban') && !reason)}
                            className={cn(
                                "rounded-xl",
                                actionDialog.type === 'approve' && "bg-green-600 hover:bg-green-700",
                                actionDialog.type === 'suspend' && "bg-amber-600 hover:bg-amber-700",
                                actionDialog.type === 'ban' && "bg-red-600 hover:bg-red-700"
                            )}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
