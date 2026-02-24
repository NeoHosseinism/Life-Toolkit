import { useState } from 'react';
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Monitor,
  Bell,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SettingsView() {
  const { settings, updateSettings, exportData, importData, resetData } = useApp();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, calendar, setCalendar, currency, setCurrency, t } = useLanguage();
  
  const [importJson, setImportJson] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      importData(importJson);
      setImportJson('');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleReset = () => {
    resetData();
    setIsResetDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t('general')}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('appearance')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t('notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('data')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('language')} & {t('region')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('language')}</Label>
                  <p className="text-sm text-muted-foreground">{t('selectLanguage')}</p>
                </div>
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'fa')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    <SelectItem value="fa">{t('persian')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('calendarType')}</Label>
                  <p className="text-sm text-muted-foreground">{t('selectCalendar')}</p>
                </div>
                <Select value={calendar} onValueChange={(v) => setCalendar(v as 'jalali' | 'gregorian')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gregorian">{t('gregorian')}</SelectItem>
                    <SelectItem value="jalali">{t('jalali')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('currency')}</Label>
                  <p className="text-sm text-muted-foreground">{t('selectCurrency')}</p>
                </div>
                <Select value={currency} onValueChange={(v) => setCurrency(v as 'rial' | 'toman')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rial">{t('rial')}</SelectItem>
                    <SelectItem value="toman">{t('toman')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="w-4 h-4" />
                {t('theme')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('theme')}</Label>
                  <p className="text-sm text-muted-foreground">{t('selectTheme')}</p>
                </div>
                <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {t('light')}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {t('dark')}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        {t('system')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {t('notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t('enableNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">{t('notificationsDescription')}</p>
                </div>
                <Switch
                  checked={settings.notifications.enabled}
                  onCheckedChange={(v) => updateSettings({
                    notifications: { ...settings.notifications, enabled: v }
                  })}
                />
              </div>

              {settings.notifications.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>{t('taskReminders')}</Label>
                    <Switch
                      checked={settings.notifications.taskReminders}
                      onCheckedChange={(v) => updateSettings({
                        notifications: { ...settings.notifications, taskReminders: v }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('habitReminders')}</Label>
                    <Switch
                      checked={settings.notifications.habitReminders}
                      onCheckedChange={(v) => updateSettings({
                        notifications: { ...settings.notifications, habitReminders: v }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('pomodoroComplete')}</Label>
                    <Switch
                      checked={settings.notifications.pomodoroComplete}
                      onCheckedChange={(v) => updateSettings({
                        notifications: { ...settings.notifications, pomodoroComplete: v }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('dailySummary')}</Label>
                    <Switch
                      checked={settings.notifications.dailySummary}
                      onCheckedChange={(v) => updateSettings({
                        notifications: { ...settings.notifications, dailySummary: v }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('exportData')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('exportDescription')}</p>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {t('exportData')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t('importData')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('importDescription')}</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={t('pasteJsonHere')}
                className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm resize-none"
              />
              <Button onClick={handleImport} disabled={!importJson.trim()} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {t('importData')}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-500">
                <Trash2 className="w-4 h-4" />
                {t('deleteAllData')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('deleteDescription')}</p>
              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('deleteAllData')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      {t('areYouSure')}
                    </DialogTitle>
                    <DialogDescription>{t('thisActionCannotBeUndone')}</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      {t('cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleReset} className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
