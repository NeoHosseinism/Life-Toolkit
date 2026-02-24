import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Moon,
  Plus,
  Flame,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const exerciseTypes = [
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Gym',
  'Yoga',
  'Other',
];

const sleepQualityOptions = [
  { value: 'excellent', label: 'excellent', color: 'text-green-500' },
  { value: 'good', label: 'good', color: 'text-blue-500' },
  { value: 'fair', label: 'fair', color: 'text-yellow-500' },
  { value: 'poor', label: 'poor', color: 'text-red-500' },
];

export default function Health() {
  const { exercises, sleep, addExercise, addSleep, deleteExercise, deleteSleep } = useApp();
  const { t, toPersianNum } = useLanguage();
  const [activeTab, setActiveTab] = useState('exercise');
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [isSleepDialogOpen, setIsSleepDialogOpen] = useState(false);

  // Exercise form state
  const [exerciseType, setExerciseType] = useState('Running');
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [exerciseCalories, setExerciseCalories] = useState('');

  // Sleep form state
  const [sleepStartTime, setSleepStartTime] = useState('22:00');
  const [sleepEndTime, setSleepEndTime] = useState('06:00');
  const [sleepQuality, setSleepQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  const handleAddExercise = () => {
    addExercise({
      type: exerciseType,
      duration: parseInt(exerciseDuration) || 0,
      calories: exerciseCalories ? parseInt(exerciseCalories) : undefined,
      date: new Date().toISOString(),
    });
    setExerciseDuration('30');
    setExerciseCalories('');
    setIsExerciseDialogOpen(false);
  };

  const handleAddSleep = () => {
    const start = new Date(`2000-01-01T${sleepStartTime}`);
    const end = new Date(`2000-01-01T${sleepEndTime}`);
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    addSleep({
      date: new Date().toISOString(),
      startTime: sleepStartTime,
      endTime: sleepEndTime,
      duration: durationMinutes,
      quality: sleepQuality,
      score: calculateSleepScore(durationMinutes, sleepQuality),
    });
    setIsSleepDialogOpen(false);
  };

  const calculateSleepScore = (duration: number, quality: string): number => {
    const hours = duration / 60;
    let score = 0;
    if (hours >= 7 && hours <= 9) score = 100;
    else if (hours >= 6) score = 80;
    else if (hours >= 5) score = 60;
    else score = 40;

    const qualityMultiplier = {
      excellent: 1,
      good: 0.9,
      fair: 0.7,
      poor: 0.5,
    };

    return Math.round(score * qualityMultiplier[quality as keyof typeof qualityMultiplier]);
  };

  // Stats
  const totalExerciseMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);
  const totalCalories = exercises.reduce((sum, e) => sum + (e.calories || 0), 0);
  const avgSleepDuration = sleep.length > 0
    ? sleep.reduce((sum, s) => sum + s.duration, 0) / sleep.length / 60
    : 0;

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const exerciseChartData = last7Days.map(date => {
    const dayExercises = exercises.filter(e => e.date.startsWith(date));
    return {
      name: date.slice(5),
      minutes: dayExercises.reduce((sum, e) => sum + e.duration, 0),
    };
  });

  const sleepChartData = last7Days.map(date => {
    const daySleep = sleep.find(s => s.date.startsWith(date));
    return {
      name: date.slice(5),
      hours: daySleep ? Math.round(daySleep.duration / 60 * 10) / 10 : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('exercise')}</p>
                  <p className="text-2xl font-bold">
                    {toPersianNum(Math.round(totalExerciseMinutes / 60 * 10) / 10)}h
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {toPersianNum(totalCalories)} {t('calories')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('sleep')}</p>
                  <p className="text-2xl font-bold">
                    {toPersianNum(Math.round(avgSleepDuration * 10) / 10)}h
                  </p>
                  <p className="text-xs text-muted-foreground">{t('average')}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('streak')}</p>
                  <p className="text-2xl font-bold">{toPersianNum(0)}</p>
                  <p className="text-xs text-muted-foreground">{t('days')}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {t('exercise')}
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            {t('sleep')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercise" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('recentActivity')}</h3>
            <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('exercise')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('type')}</Label>
                    <Select value={exerciseType} onValueChange={setExerciseType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('duration')} ({t('minutes')})</Label>
                    <Input
                      type="number"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('calories')} ({t('optional')})</Label>
                    <Input
                      type="number"
                      value={exerciseCalories}
                      onChange={(e) => setExerciseCalories(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <Button onClick={handleAddExercise} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Exercise Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('weekly')} {t('activity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="minutes" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Exercises List */}
          <div className="space-y-2">
            {exercises.slice(-5).reverse().map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{exercise.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exercise.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{toPersianNum(exercise.duration)} {t('minutes')}</p>
                        {exercise.calories && (
                          <p className="text-sm text-muted-foreground">
                            {toPersianNum(exercise.calories)} {t('calories')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExercise(exercise.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {exercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('sleep')} {t('history')}</h3>
            <Dialog open={isSleepDialogOpen} onOpenChange={setIsSleepDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('sleep')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('bedtime')}</Label>
                      <Input
                        type="time"
                        value={sleepStartTime}
                        onChange={(e) => setSleepStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('wakeTime')}</Label>
                      <Input
                        type="time"
                        value={sleepEndTime}
                        onChange={(e) => setSleepEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('sleepQuality')}</Label>
                    <Select value={sleepQuality} onValueChange={(v) => setSleepQuality(v as typeof sleepQuality)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sleepQualityOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {t(opt.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddSleep} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sleep Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('weekly')} {t('sleep')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sleep List */}
          <div className="space-y-2">
            {sleep.slice(-5).reverse().map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(s.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.startTime} - {s.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {toPersianNum(Math.round(s.duration / 60 * 10) / 10)}h
                        </p>
                        <p className={`text-sm ${sleepQualityOptions.find(q => q.value === s.quality)?.color}`}>
                          {t(s.quality)}
                        </p>
                      </div>
                      {s.score && (
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center">
                            <span className="text-sm font-bold">{toPersianNum(s.score)}</span>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSleep(s.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {sleep.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Moon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
