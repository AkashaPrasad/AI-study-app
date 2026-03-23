import { useMemo } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { isOverdue } from '../utils/helpers';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks } from 'date-fns';

const useProgress = () => {
  const { subjects, topics, tasks } = useStudyContext();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const overdue = tasks.filter(t => t.status !== 'Completed' && isOverdue(t.deadline)).length;
    const revision = tasks.filter(t => t.status === 'Revision').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, revision, completionRate };
  }, [tasks]);

  const subjectProgress = useMemo(() => {
    return subjects.map(subject => {
      const subTopics = topics.filter(t => t.subjectId === subject.id);
      const subTasks = tasks.filter(t => t.subject === subject.id);
      const completedTopics = subTopics.filter(t => t.status === 'Completed').length;
      const completedTasks = subTasks.filter(t => t.status === 'Completed').length;
      return {
        name: subject.name,
        color: subject.color,
        totalTopics: subTopics.length,
        completedTopics,
        totalTasks: subTasks.length,
        completedTasks,
        progress: subTopics.length > 0 ? Math.round((completedTopics / subTopics.length) * 100) : 0
      };
    });
  }, [subjects, topics, tasks]);

  const weeklyProductivity = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weekData = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const completedOnDay = tasks.filter(t =>
          t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dayStr
        ).length;
        return { day: format(day, 'EEE'), date: dayStr, completed: completedOnDay };
      });
      weeks.push({
        label: `Week ${format(weekStart, 'MMM d')}`,
        total: weekData.reduce((acc, d) => acc + d.completed, 0),
        days: weekData
      });
    }
    return weeks;
  }, [tasks]);

  return { stats, subjectProgress, weeklyProductivity };
};

export default useProgress;
