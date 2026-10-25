import { useMemo } from 'react'
import { AlertCircle, ArrowRight, CalendarDays, Check, CheckCircle2, Download, FileQuestion, Flag, ShieldCheck, Target, TrendingUp } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import { chapters, getModuleForChapter, questions, totalPoints } from '../data'
import { useStudy } from '../store/StudyContext'
import { dateKey, downloadJson, formatShortDate, percent } from '../utils'

interface PlanPageProps {
  onChapter: (chapterId: string, pointId?: string) => void
  onPractice: (moduleId: string) => void
}

export default function PlanPage({ onChapter, onPractice }: PlanPageProps) {
  const { state, updatePlan } = useStudy()
  const completedChapters = chapters.filter((chapter) => chapter.points.every((point) => state.completedPoints.includes(point.id)))
  const remainingChapters = chapters.filter((chapter) => !completedChapters.some((done) => done.id === chapter.id))
  const quizCorrect = Object.values(state.quiz).filter((record) => record.result === 'correct').length
  const wrongQuestions = questions.filter((question) => state.quiz[question.id]?.result === 'wrong')
  const overall = percent(state.completedPoints.length, totalPoints)
  const weeklyGoal = Math.max(1, Math.min(8, state.plan.weeklyGoal || 3))
  const estimatedWeeks = remainingChapters.length ? Math.ceil(remainingChapters.length / weeklyGoal) : 0

  const examInfo = useMemo(() => {
    if (!state.plan.examDate) return null
    const today = new Date(`${dateKey()}T12:00:00`)
    const exam = new Date(`${state.plan.examDate}T12:00:00`)
    const days = Math.ceil((exam.getTime() - today.getTime()) / 86400000)
    const weeks = Math.max(1, Math.ceil(days / 7))
    return { days, weeks, required: Math.ceil(remainingChapters.length / weeks) }
  }, [state.plan.examDate, remainingChapters.length])

  const activityDays = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - index))
    const key = dateKey(date)
    return { key, day: date.getDate(), weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()], value: state.activity[key] ?? 0 }
  }), [state.activity])
  const maxActivity = Math.max(1, ...activityDays.map((day) => day.value))
  const activeDays = Object.values(state.activity).filter((value) => value > 0).length

  const upcomingWeeks = Array.from({ length: 4 }, (_, week) => ({
    week,
    chapters: remainingChapters.slice(week * weeklyGoal, (week + 1) * weeklyGoal),
  })).filter((week) => week.chapters.length > 0)

  return (
    <div className="page plan-page">
      <header className="page-title-row">
        <div><span className="section-kicker">REVIEW COMPASS · 复习计划</span><h1>看得见进度，<br />也知道下一步。</h1><p>以首轮学习、错题复盘和每周章数为目标，所有变化都会自动保存。</p></div>
        <button className="button secondary" onClick={() => downloadJson(`药理学学习备份-${dateKey()}.json`, state)}><Download size={16} />导出全部备份</button>
      </header>

      <section className="plan-overview">
        <div className="plan-ring-block"><ProgressRing value={overall} size={132} stroke={10} label="首轮进度" /><div><span className="section-kicker">YOUR PROGRESS</span><h2>{overall === 100 ? '首轮已完成，开始错题复盘。' : overall >= 50 ? '已经过半，保持自己的节奏。' : '每一个小勾，都在靠近终点。'}</h2><p>已完成 {state.completedPoints.length} 个知识点、{completedChapters.length} 个完整章节。</p></div></div>
        <div className="plan-metric-grid">
          <div><CheckCircle2 size={19} /><strong>{state.completedPoints.length}<small> / {totalPoints}</small></strong><span>知识点</span></div>
          <div><Flag size={19} /><strong>{completedChapters.length}<small> / 23</small></strong><span>完整章节</span></div>
          <div><FileQuestion size={19} /><strong>{quizCorrect}<small> / 64</small></strong><span>答对题数</span></div>
          <div><AlertCircle size={19} /><strong>{wrongQuestions.length}</strong><span>待复盘错题</span></div>
        </div>
      </section>

      <div className="plan-main-grid">
        <section className="plan-settings-card">
          <div className="section-heading compact"><div><span className="section-kicker">YOUR TARGET</span><h2>设置复习节奏</h2></div><Target size={22} /></div>
          <label className="exam-date-label"><span>目标考试日</span><input type="date" value={state.plan.examDate} onChange={(event) => updatePlan({ examDate: event.target.value })} /></label>
          <div className="weekly-goal-label"><span>每周学习目标</span><strong>{weeklyGoal} 章 / 周</strong></div>
          <input className="goal-range" type="range" min="1" max="8" step="1" value={weeklyGoal} onChange={(event) => updatePlan({ weeklyGoal: Number(event.target.value) })} />
          <div className="range-labels"><span>轻松 1 章</span><span>冲刺 8 章</span></div>
          <div className="plan-estimate">
            <TrendingUp size={20} />
            <div><strong>按当前节奏，预计 {estimatedWeeks || 0} 周完成剩余首轮</strong><p>剩余 {remainingChapters.length} 章。完成后建议把每周重点切换为错题与主观题复述。</p></div>
          </div>
          {examInfo && <div className={examInfo.days < 0 ? 'exam-info overdue' : 'exam-info'}><CalendarDays size={18} /><p>{examInfo.days < 0 ? `目标日 ${formatShortDate(state.plan.examDate)} 已过，请更新日期。` : `距离 ${formatShortDate(state.plan.examDate)} 还有 ${examInfo.days} 天；若完成剩余 ${remainingChapters.length} 章，需要约 ${examInfo.required} 章 / 周。`}</p></div>}
        </section>

        <section className="activity-card">
          <div className="section-heading compact"><div><span className="section-kicker">LAST 14 DAYS</span><h2>学习活跃度</h2></div><span className="active-days">累计 {activeDays} 天有记录</span></div>
          <div className="activity-chart">
            {activityDays.map((day) => <div className="activity-day" key={day.key} title={`${day.key}：${day.value} 次学习记录`}><span>{day.value || ''}</span><div><i style={{ height: `${Math.max(day.value ? 12 : 3, (day.value / maxActivity) * 100)}%` }} /></div><small>{day.day}<em>{day.weekday}</em></small></div>)}
          </div>
          <div className="activity-caption"><span><i />完成知识点、批注或提交答案都会记录一次活动</span><strong>最近 14 天</strong></div>
        </section>
      </div>

      <section className="weekly-plan-section">
        <div className="section-heading"><div><span className="section-kicker">UP NEXT</span><h2>按目标生成的四周路线</h2><p>未完成章节会依次补入；每完成一章，路线自动向前推进。</p></div></div>
        {upcomingWeeks.length ? <div className="weekly-plan-grid">
          {upcomingWeeks.map((week) => <div className="week-column" key={week.week}><header><span>{week.week === 0 ? '本周' : `第 ${week.week + 1} 周`}</span><small>{week.chapters.length} 章</small></header>{week.chapters.map((chapter) => {
            const module = getModuleForChapter(chapter.id)!
            const complete = chapter.points.filter((point) => state.completedPoints.includes(point.id)).length
            return <button key={chapter.id} onClick={() => onChapter(chapter.id)}><span className={`module-dot tone-${module.tone}`} /><div><strong>{chapter.title}</strong><small>第 {chapter.number} 章 · {complete}/{chapter.points.length} 知识点</small></div><ArrowRight size={15} /></button>
          })}</div>)}
        </div> : <div className="plan-complete"><Check size={25} /><h3>23 章首轮已全部完成</h3><p>接下来优先复盘 {wrongQuestions.length} 道错题，并练习不看答案复述简答题。</p></div>}
      </section>

      <section className="review-priority">
        <div><span className="section-kicker">REVIEW PRIORITY</span><h2>{wrongQuestions.length ? `先复盘 ${wrongQuestions.length} 道需要巩固的题` : '建立你的第一轮错题本'}</h2><p>{wrongQuestions.length ? '错题来自各板块自评或自动判题，回到对应知识点后再答一次。' : '做题时点击“需要复习”，网站会自动把题目加入错题复习。'}</p></div>
        <button className="button primary" onClick={() => onPractice(wrongQuestions[0]?.id.split('-')[0] ?? 'm1')}><FileQuestion size={17} />{wrongQuestions.length ? '进入错题复盘' : '去做第一组题'}<ArrowRight size={16} /></button>
      </section>

      <section className="backup-note"><ShieldCheck size={20} /><div><strong>本地自动保存已开启</strong><p>进度、笔记和答案只保存在当前浏览器。清除网站数据、使用无痕窗口或更换设备会导致记录不可用；建议每周导出一次全部备份。</p></div></section>
    </div>
  )
}
