import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Moon,
  Target,
  Settings,
  History,
  Flame,
  Link2,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TimerType = 'focus' | 'shortBreak' | 'longBreak';

const timerConfigs: Record<TimerType, { minutes: number; label: string; color: string; icon: React.ElementType }> = {
  focus: { minutes: 25, label: 'focus', color: '#ef4444', icon: Target },
  shortBreak: { minutes: 5, label: 'shortBreak', color: '#22c55e', icon: Coffee },
  longBreak: { minutes: 15, label: 'longBreak', color: '#3b82f6', icon: Moon },
};

export default function Pomodoro() {
  const { pomodoroSessions, addPomodoroSession, settings, updateSettings, tasks } = useApp();
  const { t, toPersianNum, isRTL } = useLanguage();

  const [timerType, setTimerType]       = useState<TimerType>('focus');
  const [timeLeft, setTimeLeft]         = useState(timerConfigs.focus.minutes * 60);
  const [isRunning, setIsRunning]       = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [linkedTaskId, setLinkedTaskId] = useState<string>('none');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only show incomplete tasks for linking
  const activeTasks = tasks.filter(t => t.status !== 'done');

  const config = timerConfigs[timerType];
  const totalTime = config.minutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    setTimeLeft(config.minutes * 60);
    setIsRunning(false);
  }, [timerType, config.minutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setSessionsCompleted(prev => prev + 1);
    
    addPomodoroSession({
      startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: totalTime,
      type: timerType,
      completed: true,
      taskId: linkedTaskId !== 'none' ? linkedTaskId : undefined,
    });

    if (timerType === 'focus' && settings.pomodoro.autoStartBreaks) {
      setTimerType(sessionsCompleted % 4 === 3 ? 'longBreak' : 'shortBreak');
      setIsRunning(true);
    } else if (timerType !== 'focus' && settings.pomodoro.autoStartPomodoros) {
      setTimerType('focus');
      setIsRunning(true);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(config.minutes * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    handleTimerComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianNum(mins.toString().padStart(2, '0'))}:${toPersianNum(secs.toString().padStart(2, '0'))}`;
  };

  // Today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroSessions.filter(s => s.startTime.startsWith(today));
  const todayFocusTime = todaySessions
    .filter(s => s.type === 'focus')
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('today')}</p>
            <p className="text-2xl font-bold">{toPersianNum(todaySessions.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('focusTime')}</p>
            <p className="text-2xl font-bold">
              {toPersianNum(Math.round(todayFocusTime / 60))}m
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('sessions')}</p>
            <p className="text-2xl font-bold">{toPersianNum(sessionsCompleted)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('streak')}</p>
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-2xl font-bold">{toPersianNum(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Timer Type Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {(Object.keys(timerConfigs) as TimerType[]).map((type) => {
                const Icon = timerConfigs[type].icon;
                return (
                  <Button
                    key={type}
                    variant={timerType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimerType(type)}
                    className="flex items-center gap-2"
                    style={timerType === type ? { backgroundColor: timerConfigs[type].color } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(timerConfigs[type].label)}</span>
                  </Button>
                );
              })}
            </div>

            {/* Timer Circle */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-64 lg:h-64 mx-auto mb-8">
              {/* Pulsing ring when running */}
              {isRunning && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: config.color }}
                  animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className="relative w-full h-full">
              {/* Background circle */}
              <svg viewBox="0 0 256 256" className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 7.54} 754`}
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-6xl font-bold tabular-nums"
                  style={{ color: config.color }}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <p className="text-muted-foreground mt-2">{t(config.label)}</p>
              </div>
              </div>
            </div>

            {/* Task Link */}
            {activeTasks.length > 0 && (
              <div className="mt-6">
                <div className={`flex items-center gap-2 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{isRTL ? 'پیوند به وظیفه' : 'Link to task'}</span>
                </div>
                <Select value={linkedTaskId} onValueChange={setLinkedTaskId} disabled={isRunning}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={isRTL ? 'انتخاب وظیفه...' : 'Select task...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isRTL ? 'بدون پیوند' : 'No task'}</SelectItem>
                    {activeTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        <span className="truncate">{task.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                aria-label="Reset timer"
                className="w-11 h-11 rounded-full"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                onClick={toggleTimer}
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                className="w-24 h-24 rounded-full btn-shine"
                style={{ backgroundColor: config.color }}
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={skipTimer}
                aria-label="Skip to next session"
                className="w-11 h-11 rounded-full"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('focus')} ({t('minutes')})</Label>
              <Select
                value={String(settings.pomodoro.focusDuration)}
                onValueChange={(v) => updateSettings({
                  pomodoro: { ...settings.pomodoro, focusDuration: parseInt(v) }
                })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30, 45, 60].map(m => (
                    <SelectItem key={m} value={String(m)}>{toPersianNum(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('shortBreak')} ({t('minutes')})</Label>
              <Select
                value={String(settings.pomodoro.shortBreakDuration)}
                onValueChange={(v) => updateSettings({
                  pomodoro: { ...settings.pomodoro, shortBreakDuration: parseInt(v) }
                })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 15].map(m => (
                    <SelectItem key={m} value={String(m)}>{toPersianNum(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('autoStartBreaks')}</Label>
              <Switch
                checked={settings.pomodoro.autoStartBreaks}
                onCheckedChange={(v) => updateSettings({
                  pomodoro: { ...settings.pomodoro, autoStartBreaks: v }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              {t('recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pomodoroSessions.slice(-10).reverse().map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {session.type === 'focus' ? (
                      <Target className="w-4 h-4 text-red-500" />
                    ) : session.type === 'shortBreak' ? (
                      <Coffee className="w-4 h-4 text-green-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm">{t(session.type)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {toPersianNum(Math.round(session.duration / 60))}m
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {pomodoroSessions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {t('noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
