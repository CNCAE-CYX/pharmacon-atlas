import { ArrowRight, BookMarked, Check, ChevronRight, Clock3, FileQuestion, Highlighter, Layers3, Play, ShieldCheck, Sparkles, Target } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import { chapters, courseStats, modules, questions, totalPoints } from '../data'
import { useStudy } from '../store/StudyContext'
import type { ViewName } from '../types'
import { asset, percent } from '../utils'

interface HomePageProps {
  onChapter: (chapterId: string, pointId?: string) => void
  onNavigate: (view: ViewName) => void
  onPractice: (moduleId: string) => void
}

export default function HomePage({ onChapter, onNavigate, onPractice }: HomePageProps) {
  const { state } = useStudy()
  const completed = state.completedPoints.length
  const overall = percent(completed, totalPoints)
  const nextChapter = chapters.find((chapter) => chapter.points.some((point) => !state.completedPoints.includes(point.id))) ?? chapters[chapters.length - 1]
  const nextPoint = nextChapter.points.find((point) => !state.completedPoints.includes(point.id)) ?? nextChapter.points[0]
  const nextModule = modules.find((module) => module.chapters.some((chapter) => chapter.id === nextChapter.id)) ?? modules[0]
  const quizCorrect = Object.values(state.quiz).filter((record) => record.result === 'correct').length
  const featured = ['m2-q2', 'm4-q2', 'm8-q1'].map((id) => questions.find((question) => question.id === id)!)

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span />YOUR PHARMACOLOGY, ORGANIZED</div>
          <h1>把药理学，学成一张<br /><em>可以回看的地图。</em></h1>
          <p>从递质与受体出发，到每一道往年题。109 个知识点循序渐进，原课件、批注与复习进度始终连在一起。</p>
          <div className="hero-actions">
            <button className="button primary large" onClick={() => onChapter(nextChapter.id, nextPoint.id)}><Play size={17} fill="currentColor" />{completed ? '继续上次学习' : '从第一课开始'}<ArrowRight size={17} /></button>
            <button className="button text-button" onClick={() => onNavigate('course')}>查看完整学习路径<ChevronRight size={17} /></button>
          </div>
          <div className="hero-proof">
            <span><Check size={14} />无需登录</span>
            <span><Check size={14} />记录本地保存</span>
            <span><Check size={14} />真题逐题标注</span>
          </div>
        </div>

        <div className="hero-studyboard" aria-label="原课件与学习进度预览">
          <div className="studyboard-label">FROM YOUR COURSEWARE</div>
          <div className="hero-slide-card">
            <img src={asset('sources/ch13/p009.webp')} alt="原课件：三种肾上腺素受体激动药的作用靶点比较" />
            <div><span>原课件 · 第 13 章 / 第 9 页</span><strong>先受体，后器官</strong></div>
          </div>
          <div className="hero-progress-card">
            <ProgressRing value={overall} size={86} stroke={7} label="总进度" />
            <div><small>你的学习地图</small><strong>{completed} / {totalPoints} 个知识点</strong><span>{state.marks.length} 条标记与批注</span></div>
          </div>
          <div className="hero-note-card"><Highlighter size={17} /><span>选中正文即可<br /><strong>重点 / 下划线 / 批注</strong></span></div>
        </div>
      </section>

      <section className="stat-ribbon" aria-label="课程内容统计">
        <div><strong>{courseStats.modules}</strong><span>学习板块</span></div>
        <i />
        <div><strong>{courseStats.chapters}</strong><span>课程章节</span></div>
        <i />
        <div><strong>{courseStats.points}</strong><span>递进知识点</span></div>
        <i />
        <div><strong>{courseStats.questions}</strong><span>真题 + 补充题</span></div>
        <i />
        <div><strong>{courseStats.sourcePages}</strong><span>可溯源课件页</span></div>
      </section>

      <section className="continue-section">
        <div className="section-heading">
          <div><span className="section-kicker">NEXT UP</span><h2>今天，从这一小步继续</h2></div>
          <span className="quiet-label"><Clock3 size={15} />预计 {nextChapter.duration} 分钟</span>
        </div>
        <div className="continue-card">
          <div className="continue-index"><small>CHAPTER</small><strong>{String(nextChapter.number).padStart(2, '0')}</strong></div>
          <div className="continue-info">
            <span>{nextModule.title} / {nextModule.shortTitle}</span>
            <h3>{nextChapter.title}</h3>
            <p>{nextChapter.intro}</p>
            <div className="continue-next-point"><Target size={15} /><span>下一知识点：{nextPoint.title}</span></div>
          </div>
          <div className="continue-action">
            <button className="round-arrow" onClick={() => onChapter(nextChapter.id, nextPoint.id)} aria-label="继续学习"><ArrowRight size={23} /></button>
            <span>接着学</span>
          </div>
        </div>
        <div className="study-method">
          <div><span>01</span><BookMarked size={20} /><strong>理解机制</strong><p>先读简化链条，不直接硬背。</p></div>
          <div><span>02</span><Layers3 size={20} /><strong>对照原页</strong><p>每个知识点都能返回课件。</p></div>
          <div><span>03</span><FileQuestion size={20} /><strong>主动回忆</strong><p>用真题和补充题检验掌握。</p></div>
        </div>
      </section>

      <section className="module-map-section">
        <div className="section-heading">
          <div><span className="section-kicker">COURSE MAP</span><h2>八大板块，按教学进度展开</h2><p>总论 → 传出 → 中枢 → 心血管 → 激素 → 血尿 → 化疗</p></div>
          <button className="button ghost" onClick={() => onNavigate('course')}>全部章节<ArrowRight size={16} /></button>
        </div>
        <div className="module-grid">
          {modules.map((module) => {
            const points = module.chapters.flatMap((chapter) => chapter.points)
            const done = points.filter((point) => state.completedPoints.includes(point.id)).length
            const moduleProgress = percent(done, points.length)
            const chapter = module.chapters.find((item) => item.points.some((point) => !state.completedPoints.includes(point.id))) ?? module.chapters[0]
            return (
              <button className={`module-card tone-card-${module.tone}`} key={module.id} onClick={() => onChapter(chapter.id)}>
                <div className="module-card-top"><span>{String(module.order).padStart(2, '0')}</span><i className={`module-dot tone-${module.tone}`} /><small>{module.chapters.length} 章</small></div>
                <h3>{module.title}</h3>
                <p>{module.subtitle}</p>
                <div className="module-card-progress"><div><i style={{ width: `${moduleProgress}%` }} /></div><span>{moduleProgress}%</span></div>
                <div className="module-card-bottom"><span>{done}/{points.length} 知识点</span><ArrowRight size={17} /></div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="home-bottom-grid">
        <div className="past-paper-panel">
          <div className="section-heading compact"><div><span className="section-kicker">PAST PAPERS</span><h2>从往年题倒推复习重点</h2></div><button className="icon-button" onClick={() => onPractice('m2')}><ArrowRight size={18} /></button></div>
          <div className="featured-questions">
            {featured.map((question) => (
              <button key={question.id} onClick={() => onPractice(question.id.split('-')[0])}>
                <span className="past-badge">往年真题</span>
                <p>{question.prompt}</p>
                <small>{question.source}</small>
              </button>
            ))}
          </div>
        </div>
        <aside className="local-panel">
          <span className="local-panel-icon"><ShieldCheck size={25} /></span>
          <span className="section-kicker">PRIVATE BY DESIGN</span>
          <h2>你的记录，<br />只留在你的设备。</h2>
          <p>完成进度、重点下划线、批注和答题结果全部写入浏览器本地存储。无需账户，也不会上传课程内容。</p>
          <div className="local-metrics"><span><strong>{quizCorrect}</strong>答对题数</span><span><strong>{state.marks.length}</strong>本地记录</span></div>
          <button className="button secondary" onClick={() => onNavigate('plan')}>查看我的复习计划<ArrowRight size={16} /></button>
          <div className="local-tip"><Sparkles size={15} /><span>更换浏览器或清除网站数据前，请先在复习计划页导出备份。</span></div>
        </aside>
      </section>
    </div>
  )
}
