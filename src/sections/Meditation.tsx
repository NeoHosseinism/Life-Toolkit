import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  Sparkles,
  Wind,
  Sun,
  Moon,
  Heart,
  History,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const meditationTypes = [
  { id: 'mindfulness', label: 'mindfulness', icon: Sparkles, color: '#8b5cf6' },
  { id: 'breathing', label: 'breathing', icon: Wind, color: '#06b6d4' },
  { id: 'bodyScan', label: 'bodyScan', icon: Heart, color: '#ec4899' },
  { id: 'lovingKindness', label: 'lovingKindness', icon: Sun, color: '#f59e0b' },
  { id: 'sleep', label: 'sleep', icon: Moon, color: '#3b82f6' },
];

const durationOptions = [5, 10, 15, 20, 30, 45, 60];

export default function Meditation() {
  const { meditations, addMeditation, deleteMeditation } = useApp();
  const { t, toPersianNum, isRTL } = useLanguage();
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedType, setSelectedType] = useState('mindfulness');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedTypeConfig = meditationTypes.find(t => t.id === selectedType);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    addMeditation({
      date: new Date().toISOString(),
      duration: selectedDuration,
      type: selectedType,
      notes: sessionNote || undefined,
    });
    setSessionNote('');
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianNum(mins.toString().padStart(2, '0'))}:${toPersianNum(secs.toString().padStart(2, '0'))}`;
  };

  // Stats
  const totalSessions = meditations.length;
  const totalMinutes = meditations.reduce((sum, m) => sum + m.duration, 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = meditations.filter(m => m.date.startsWith(today));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('sessions')}</p>
            <p className="text-2xl font-bold">{toPersianNum(totalSessions)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('totalTime')}</p>
            <p className="text-2xl font-bold">{toPersianNum(Math.round(totalMinutes / 60 * 10) / 10)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('today')}</p>
            <p className="text-2xl font-bold">{toPersianNum(todaySessions.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('streak')}</p>
            <p className="text-2xl font-bold">{toPersianNum(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            {/* Type Selector */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {meditationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type.id)}
                    className="flex items-center gap-2"
                    style={selectedType === type.id ? { backgroundColor: type.color } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(type.label)}</span>
                  </Button>
                );
              })}
            </div>

            {/* Duration Selector */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8">
              {durationOptions.map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration === duration ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDurationChange(duration)}
                  className="min-w-[48px]"
                  style={selectedDuration === duration ? { backgroundColor: selectedTypeConfig?.color } : {}}
                >
                  {toPersianNum(duration)}
                </Button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="relative flex justify-center mb-8">
              {/* Breathing animation circle */}
              <motion.div
                className="absolute w-64 h-64 rounded-full opacity-20"
                style={{ backgroundColor: selectedTypeConfig?.color }}
                animate={isRunning ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                } : {}}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Timer circle */}
              <div
                className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center border-4"
                style={{ borderColor: selectedTypeConfig?.color }}
              >
                <span className="text-5xl font-bold tabular-nums" style={{ color: selectedTypeConfig?.color }}>
                  {formatTime(timeLeft)}
                </span>
                <p className="text-muted-foreground mt-2">{t(selectedTypeConfig?.label || 'mindfulness')}</p>
              </div>
            </div>

            {/* Breathing cue */}
            {selectedType === 'breathing' && isRunning && (
              <motion.p
                className="text-center text-sm text-muted-foreground mb-4 -mt-4"
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isRTL ? 'نفس بکش...' : 'Breathe in...'}
              </motion.p>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="w-12 h-12"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full btn-shine"
                style={{ backgroundColor: selectedTypeConfig?.color }}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('add')} {t('meditation')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>{t('type')}</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meditationTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {t(type.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('duration')} ({t('minutes')})</Label>
                      <Select
                        value={String(selectedDuration)}
                        onValueChange={(v) => handleDurationChange(parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map(d => (
                            <SelectItem key={d} value={String(d)}>
                              {toPersianNum(d)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('notes')} ({t('optional')})</Label>
                      <Input
                        value={sessionNote}
                        onChange={(e) => setSessionNote(e.target.value)}
                        placeholder={t('notes')}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        handleSessionComplete();
                        setIsAddDialogOpen(false);
                      }}
                      className="w-full"
                    >
                      {t('save')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            {t('recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meditations.slice(-10).reverse().map((session, index) => {
              const typeConfig = meditationTypes.find(t => t.id === session.type);
              const Icon = typeConfig?.icon || Sparkles;
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${typeConfig?.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: typeConfig?.color }} />
                    </div>
                    <div>
                      <p className="font-medium">{t(session.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{toPersianNum(session.duration)}m</p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeditation(session.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
            {meditations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
