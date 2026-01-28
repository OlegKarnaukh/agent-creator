import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const systemFields = [
    { value: 'имя', label: 'Имя*' },
    { value: 'телефон', label: 'Телефон*' },
    { value: 'кастомное_поле_1', label: 'Кастомное поле 1' },
    { value: 'кастомное_поле_2', label: 'Кастомное поле 2' },
    { value: 'кастомное_поле_3', label: 'Кастомное поле 3' },
    { value: 'skip', label: 'Пропустить' }
];

export default function UploadContactsDialog({ open, onOpenChange, campaignId }) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [fieldMapping, setFieldMapping] = useState({});
    const [customFieldNames, setCustomFieldNames] = useState({
        кастомное_поле_1: 'Кастомное поле 1',
        кастомное_поле_2: 'Кастомное поле 2',
        кастомное_поле_3: 'Кастомное поле 3'
    });

    const uploadMutation = useMutation({
        mutationFn: async (contacts) => {
            const created = await base44.entities.CallContact.bulkCreate(contacts);
            
            // Update campaign stats
            const campaign = await base44.entities.CallCampaign.list();
            const currentCampaign = campaign.find(c => c.id === campaignId);
            if (currentCampaign) {
                await base44.entities.CallCampaign.update(campaignId, {
                    всего_контактов: (currentCampaign.всего_контактов || 0) + contacts.length
                });
            }
            
            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts', campaignId]);
            queryClient.invalidateQueries(['campaign', campaignId]);
            toast.success('Контакты загружены');
            resetDialog();
        }
    });

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            setParsedData({ headers, rows });
            
            // Auto-map common fields
            const autoMapping = {};
            headers.forEach((header, index) => {
                const lowerHeader = header.toLowerCase();
                if (lowerHeader.includes('имя') || lowerHeader.includes('name')) {
                    autoMapping[index] = 'имя';
                } else if (lowerHeader.includes('телефон') || lowerHeader.includes('phone')) {
                    autoMapping[index] = 'телефон';
                }
            });
            setFieldMapping(autoMapping);
            
            setStep(2);
        };
        reader.readAsArrayBuffer(uploadedFile);
    };

    const handleUpload = () => {
        if (!parsedData) return;

        const hasName = Object.values(fieldMapping).includes('имя');
        const hasPhone = Object.values(fieldMapping).includes('телефон');

        if (!hasName || !hasPhone) {
            toast.error('Необходимо сопоставить обязательные поля: Имя и Телефон');
            return;
        }

        const contacts = parsedData.rows
            .filter(row => row.length > 0)
            .map(row => {
                const contact = {
                    кампания_id: campaignId,
                    статус: 'ожидает'
                };

                Object.entries(fieldMapping).forEach(([colIndex, field]) => {
                    if (field !== 'skip' && row[colIndex]) {
                        contact[field] = String(row[colIndex]);
                    }
                });

                return contact;
            })
            .filter(contact => contact.имя && contact.телефон);

        setStep(3);
        uploadMutation.mutate(contacts);
    };

    const resetDialog = () => {
        setStep(1);
        setFile(null);
        setParsedData(null);
        setFieldMapping({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={resetDialog}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && 'Загрузка файла'}
                        {step === 2 && 'Сопоставление полей'}
                        {step === 3 && 'Загрузка контактов'}
                    </DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-700 font-medium mb-2">
                                    Перетащите файл Excel или CSV сюда
                                </p>
                                <p className="text-sm text-slate-500 mb-4">
                                    или нажмите для выбора
                                </p>
                                <p className="text-xs text-slate-400">
                                    Поддерживаемые форматы: .xlsx, .xls, .csv
                                </p>
                            </label>
                        </div>
                    </div>
                )}

                {step === 2 && parsedData && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Сопоставьте колонки файла с полями системы
                        </p>

                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {parsedData.headers.map((header, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Label className="text-sm font-medium text-slate-900">
                                                {header}
                                            </Label>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Пример: {parsedData.rows.slice(0, 3).map(row => row[index]).filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        <div className="w-48">
                                            <Select
                                                value={fieldMapping[index]}
                                                onValueChange={(value) => setFieldMapping({ ...fieldMapping, [index]: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите поле" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {systemFields.map(field => (
                                                        <SelectItem key={field.value} value={field.value}>
                                                            {field.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Назад
                            </Button>
                            <Button onClick={handleUpload}>
                                Загрузить
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-8">
                        {uploadMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
                                <p className="text-slate-700">Загрузка контактов...</p>
                            </>
                        ) : uploadMutation.isError ? (
                            <>
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-slate-700 mb-4">Ошибка загрузки</p>
                                <Button onClick={() => setStep(2)}>Попробовать снова</Button>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <p className="text-slate-700">Контакты успешно загружены!</p>
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}