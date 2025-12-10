"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Palette,
    Save,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    Image as ImageIcon
} from "lucide-react";
import { platformSettingsService, PlatformSettings } from "@/services/platformSettingsService";

export default function BrandingPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        platform_name: '',
        tagline: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#14B8A6',
        secondary_color: '#8B5CF6',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await platformSettingsService.getSettings();
        setSettings(data);
        setFormData({
            platform_name: data.platform_name || '',
            tagline: data.tagline || '',
            logo_url: data.logo_url || '',
            favicon_url: data.favicon_url || '',
            primary_color: data.primary_color || '#14B8A6',
            secondary_color: data.secondary_color || '#8B5CF6',
        });
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const result = await platformSettingsService.updateBranding(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Branding atualizado com sucesso!' });
            await loadSettings();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao salvar' });
        }

        setSaving(false);
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
        setUploading(type);
        setMessage(null);

        const result = await platformSettingsService.uploadBrandingImage(file, type);

        if (result.url) {
            setFormData(prev => ({
                ...prev,
                [type === 'logo' ? 'logo_url' : 'favicon_url']: result.url
            }));
            setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Favicon'} atualizado!` });
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro no upload' });
        }

        setUploading(null);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Palette className="h-8 w-8 text-amber-500" />
                        Branding
                    </h1>
                    <p className="text-slate-400">Personalize a identidade visual da plataforma</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Alterações
                </Button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name & Tagline */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Nome & Descrição</CardTitle>
                        <CardDescription className="text-slate-400">Nome da plataforma e slogan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Nome da Plataforma</Label>
                            <Input
                                value={formData.platform_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, platform_name: e.target.value }))}
                                placeholder="MotherWorks"
                                className="bg-slate-700 border-slate-600 text-white text-lg font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Tagline / Slogan</Label>
                            <Input
                                value={formData.tagline}
                                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                                placeholder="Serviços domésticos de confiança"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Colors */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Cores da Marca</CardTitle>
                        <CardDescription className="text-slate-400">Cores primária e secundária</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Cor Primária</Label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="h-10 w-16 rounded cursor-pointer border-2 border-slate-600"
                                />
                                <Input
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="bg-slate-700 border-slate-600 text-white flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Cor Secundária</Label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    className="h-10 w-16 rounded cursor-pointer border-2 border-slate-600"
                                />
                                <Input
                                    value={formData.secondary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    className="bg-slate-700 border-slate-600 text-white flex-1"
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 bg-slate-700/50 rounded-xl">
                            <p className="text-xs text-slate-400 mb-2">Preview</p>
                            <div className="flex gap-3">
                                <div
                                    className="h-12 flex-1 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: formData.primary_color }}
                                >
                                    Primária
                                </div>
                                <div
                                    className="h-12 flex-1 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: formData.secondary_color }}
                                >
                                    Secundária
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logo */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Logo</CardTitle>
                        <CardDescription className="text-slate-400">Logo principal da plataforma (PNG, SVG)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                        />

                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-600">
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-slate-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <Button
                                    variant="outline"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={uploading === 'logo'}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    {uploading === 'logo' ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    Upload Logo
                                </Button>
                                <p className="text-xs text-slate-500 mt-2">Recomendado: 512x512px</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Favicon */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Favicon</CardTitle>
                        <CardDescription className="text-slate-400">Ícone da aba do navegador</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input
                            ref={faviconInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                        />

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-600">
                                {formData.favicon_url ? (
                                    <img src={formData.favicon_url} alt="Favicon" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon className="h-6 w-6 text-slate-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <Button
                                    variant="outline"
                                    onClick={() => faviconInputRef.current?.click()}
                                    disabled={uploading === 'favicon'}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    {uploading === 'favicon' ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    Upload Favicon
                                </Button>
                                <p className="text-xs text-slate-500 mt-2">Recomendado: 32x32px ou 64x64px</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
