import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  X,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Goals() {
  const { goals, addGoal, deleteGoal, toggleMilestone } = useApp();
  const { t, toPersianNum } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);

  const handleAddGoal = () => {
    if (goalTitle.trim()) {
      addGoal({
        title: goalTitle,
        description: goalDescription || undefined,
        deadline: goalDeadline || undefined,
        progress: 0,
        milestones: milestones.filter(m => m.trim()).map(m => ({
          id: Math.random().toString(36).substr(2, 9),
          title: m,
          completed: false,
        })),
        status: 'active',
      });
      setGoalTitle('');
      setGoalDescription('');
      setGoalDeadline('');
      setMilestones(['']);
      setIsAddDialogOpen(false);
    }
  };

  const addMilestoneField = () => {
    setMilestones([...milestones, '']);
  };

  const updateMilestoneField = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = value;
    setMilestones(newMilestones);
  };

  const removeMilestoneField = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('goals')}</p>
            <p className="text-2xl font-bold">{toPersianNum(goals.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('active')}</p>
            <p className="text-2xl font-bold text-blue-500">{toPersianNum(activeGoals.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('completed')}</p>
            <p className="text-2xl font-bold text-green-500">{toPersianNum(completedGoals.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('progress')}</p>
            <p className="text-2xl font-bold">{toPersianNum(totalProgress)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-shine">
              <Plus className="w-4 h-4 mr-2" />
              {t('add')} {t('goal')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('add')} {t('goal')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('title')}</Label>
                <Input
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder={t('title')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('description')} ({t('optional')})</Label>
                <Input
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder={t('description')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('deadline')} ({t('optional')})</Label>
                <Input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('milestones')}</Label>
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestoneField(index, e.target.value)}
                      placeholder={`${t('milestone')} ${index + 1}`}
                    />
                    {milestones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestoneField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addMilestoneField} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')} {t('milestone')}
                </Button>
              </div>
              <Button onClick={handleAddGoal} className="w-full">
                {t('save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-hover overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Progress indicator */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="6"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${goal.progress * 1.76} 176`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{toPersianNum(goal.progress)}%</span>
                    </div>
                  </div>

                  {/* Goal info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {t(goal.status)}
                          </Badge>
                          {goal.deadline && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {goal.deadline}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteGoal(goal.id)}>
                            <X className="w-4 h-4 mr-2" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {toPersianNum(goal.milestones.filter(m => m.completed).length)} / {toPersianNum(goal.milestones.length)} {t('milestones')}
                        </button>
                        
                        {expandedGoal === goal.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 space-y-2"
                          >
                            {goal.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                              >
                                <button
                                  onClick={() => toggleMilestone(goal.id, milestone.id)}
                                  className="flex-shrink-0"
                                >
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </button>
                                <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {goals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('noData')}</p>
            <p className="text-sm">{t('add')} {t('goal')} {t('toGetStarted')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
