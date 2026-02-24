import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  Flag,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Grid2X2,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task, TaskStatus, TaskPriority, EisenhowerQuadrant } from '@/types';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'todo', color: '#6b7280' },
  { id: 'inProgress', label: 'inProgress', color: '#2467ec' },
  { id: 'review', label: 'review', color: '#f59e0b' },
  { id: 'done', label: 'done', color: '#22c55e' },
];

const priorities: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'high', label: 'high', color: '#ef4444' },
  { id: 'medium', label: 'medium', color: '#f59e0b' },
  { id: 'low', label: 'low', color: '#22c55e' },
  { id: 'none', label: 'none', color: '#6b7280' },
];

const quadrants: { id: EisenhowerQuadrant; title: string; subtitle: string; color: string; bgColor: string }[] = [
  { id: 'doFirst', title: 'doFirst', subtitle: 'urgent + important', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { id: 'schedule', title: 'schedule', subtitle: 'important', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { id: 'delegate', title: 'delegate', subtitle: 'urgent', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  { id: 'eliminate', title: 'eliminate', subtitle: 'neither', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
];

type ViewMode = 'kanban' | 'list' | 'matrix';

export default function Tasks() {
  const { tasks, addTask, deleteTask, moveTask, setTaskPriority } = useApp();
  const { t, toPersianNum, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        status: 'todo',
        tags: [],
        subtasks: [],
      });
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setIsAddDialogOpen(false);
    }
  };

  const TaskCard = ({ task, compact = false }: { task: Task; compact?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      draggable
      onDragStart={() => handleDragStart(task.id)}
      className={`group bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        draggedTask === task.id ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => moveTask(task.id, task.status === 'done' ? 'todo' : 'done')}
          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          {!compact && task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: priorities.find(p => p.id === task.priority)?.color, color: priorities.find(p => p.id === task.priority)?.color }}
            >
              <Flag className="w-3 h-3 mr-1" />
              {t(task.priority)}
            </Badge>
            {task.dueDate && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {toPersianNum(task.dueDate.slice(5))}
              </Badge>
            )}
            {task.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {toPersianNum(task.tags.length)}
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => setTaskPriority(task.id, 'high')}>
              <Flag className="w-4 h-4 mr-2 text-red-500" />
              {t('high')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTaskPriority(task.id, 'medium')}>
              <Flag className="w-4 h-4 mr-2 text-yellow-500" />
              {t('medium')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTaskPriority(task.id, 'low')}>
              <Flag className="w-4 h-4 mr-2 text-green-500" />
              {t('low')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-500">
              <X className="w-4 h-4 mr-2" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => {
        const columnTasks = filteredTasks.filter(t => t.status === column.id);
        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold">{t(column.label)}</h3>
                <span className="text-sm text-muted-foreground">
                  ({toPersianNum(columnTasks.length)})
                </span>
              </div>
            </div>
            <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
              <AnimatePresence>
                {columnTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('noData')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noData')}</p>
        </div>
      )}
    </div>
  );

  const MatrixView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map(quadrant => {
        const quadrantTasks = filteredTasks.filter(t => t.quadrant === quadrant.id);
        return (
          <Card
            key={quadrant.id}
            className="overflow-hidden"
            style={{ backgroundColor: quadrant.bgColor }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: quadrant.color }}>
                    {t(quadrant.title)}
                  </h3>
                  <p className="text-xs text-muted-foreground">{quadrant.subtitle}</p>
                </div>
                <span className="text-sm font-medium" style={{ color: quadrant.color }}>
                  {toPersianNum(quadrantTasks.length)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <AnimatePresence>
                {quadrantTasks.map(task => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </AnimatePresence>
              {quadrantTasks.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {t('noData')}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{t('kanban')}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('list')}</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <Grid2X2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('matrix')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                {t('all')}
              </DropdownMenuItem>
              {priorities.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => setFilterPriority(p.id)}>
                  <Flag className="w-4 h-4 mr-2" style={{ color: p.color }} />
                  {t(p.label)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-shine">
                <Plus className="w-4 h-4 mr-2" />
                {t('addTask')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addTask')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={t('title')}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <Button
                      key={p.id}
                      variant={newTaskPriority === p.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewTaskPriority(p.id)}
                      style={newTaskPriority === p.id ? { backgroundColor: p.color } : {}}
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      {t(p.label)}
                    </Button>
                  ))}
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  {t('save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'kanban' && <KanbanView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'matrix' && <MatrixView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
