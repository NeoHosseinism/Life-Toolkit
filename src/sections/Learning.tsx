import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  X,
  TrendingUp,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const skillLevels = [
  { value: 'beginner', label: 'beginner', color: 'bg-gray-500' },
  { value: 'intermediate', label: 'intermediate', color: 'bg-blue-500' },
  { value: 'advanced', label: 'advanced', color: 'bg-purple-500' },
  { value: 'expert', label: 'expert', color: 'bg-yellow-500' },
];

export default function Learning() {
  const {
    courses,
    books,
    skills,
    addCourse,
    updateCourse,
    deleteCourse,
    addBook,
    updateBook,
    deleteBook,
    addSkill,
    updateSkill,
    deleteSkill,
  } = useApp();
  const { t, toPersianNum } = useLanguage();
  const [activeTab, setActiveTab] = useState('courses');

  // Dialog states
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);

  // Form states
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePlatform, setCoursePlatform] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');

  const handleAddCourse = () => {
    if (courseTitle.trim()) {
      addCourse({
        title: courseTitle,
        platform: coursePlatform || undefined,
        progress: 0,
        status: 'notStarted',
      });
      setCourseTitle('');
      setCoursePlatform('');
      setIsCourseDialogOpen(false);
    }
  };

  const handleAddBook = () => {
    if (bookTitle.trim()) {
      addBook({
        title: bookTitle,
        author: bookAuthor || undefined,
        progress: 0,
        status: 'notStarted',
      });
      setBookTitle('');
      setBookAuthor('');
      setIsBookDialogOpen(false);
    }
  };

  const handleAddSkill = () => {
    if (skillName.trim()) {
      addSkill({
        name: skillName,
        level: skillLevel,
        progress: skillLevel === 'beginner' ? 25 : skillLevel === 'intermediate' ? 50 : skillLevel === 'advanced' ? 75 : 100,
      });
      setSkillName('');
      setSkillLevel('beginner');
      setIsSkillDialogOpen(false);
    }
  };

  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.status === 'completed').length,
    totalBooks: books.length,
    completedBooks: books.filter(b => b.status === 'completed').length,
    totalSkills: skills.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('courses')}</p>
            <p className="text-2xl font-bold">{toPersianNum(stats.totalCourses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('completed')}</p>
            <p className="text-2xl font-bold">{toPersianNum(stats.completedCourses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('books')}</p>
            <p className="text-2xl font-bold">{toPersianNum(stats.totalBooks)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t('skills')}</p>
            <p className="text-2xl font-bold">{toPersianNum(stats.totalSkills)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">{t('courses')}</TabsTrigger>
          <TabsTrigger value="books">{t('books')}</TabsTrigger>
          <TabsTrigger value="skills">{t('skills')}</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('courses')}</h3>
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('course')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('title')}</Label>
                    <Input
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder={t('title')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('platform')} ({t('optional')})</Label>
                    <Input
                      value={coursePlatform}
                      onChange={(e) => setCoursePlatform(e.target.value)}
                      placeholder="Udemy, Coursera, etc."
                    />
                  </div>
                  <Button onClick={handleAddCourse} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        {course.platform && (
                          <p className="text-sm text-muted-foreground">{course.platform}</p>
                        )}
                      </div>
                      <Badge
                        variant={course.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {t(course.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('progress')}</span>
                        <span>{toPersianNum(course.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCourse(course.id, {
                          progress: Math.min(100, course.progress + 10),
                          status: course.progress + 10 >= 100 ? 'completed' : 'inProgress'
                        })}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +10%
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('books')}</h3>
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('book')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('title')}</Label>
                    <Input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder={t('title')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('author')} ({t('optional')})</Label>
                    <Input
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder={t('author')}
                    />
                  </div>
                  <Button onClick={handleAddBook} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        {book.author && (
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                        )}
                      </div>
                      <Badge
                        variant={book.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {t(book.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('progress')}</span>
                        <span>{toPersianNum(book.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateBook(book.id, {
                          progress: Math.min(100, book.progress + 10),
                          status: book.progress + 10 >= 100 ? 'completed' : 'reading'
                        })}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +10%
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBook(book.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('skills')}</h3>
            <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('skill')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('name')}</Label>
                    <Input
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      placeholder={t('name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('level')}</Label>
                    <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v as typeof skillLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {t(level.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddSkill} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{skill.name}</h4>
                      <Badge
                        className={skillLevels.find(l => l.value === skill.level)?.color}
                      >
                        {t(skill.level)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('progress')}</span>
                        <span>{toPersianNum(skill.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSkill(skill.id, {
                          progress: Math.min(100, skill.progress + 5)
                        })}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +5%
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSkill(skill.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
