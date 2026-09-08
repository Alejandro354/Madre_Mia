import Topbar from './Topbar'
import { BoltIcon } from './icons'
import { SkeletonBlock, SkeletonChip, SkeletonCircle, SkeletonLine } from './Skeleton'

export function BrandLoader() {
  return (
    <div className="brand-loader">
      <span className="brand-loader-mark">
        <BoltIcon />
      </span>
      <span className="brand-loader-name">
        Práctica<span className="brand-loader-name-accent">Ya</span>
      </span>
      <span className="brand-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}

function VacancyCardSkeleton() {
  return (
    <article className="vac-card">
      <div className="vac-card-head">
        <SkeletonCircle size={46} />
        <div className="vac-card-headings">
          <SkeletonLine width="82%" height={16} />
          <SkeletonLine width="55%" height={13} style={{ marginTop: 8 }} />
          <SkeletonLine width="65%" height={12} style={{ marginTop: 7 }} />
        </div>
      </div>
      <div className="vac-card-tags">
        <SkeletonChip width={72} />
        <SkeletonChip width={88} />
      </div>
      <SkeletonLine height={13} style={{ marginTop: 14 }} />
      <SkeletonLine width="86%" height={13} style={{ marginTop: 7 }} />
      <div className="vac-card-footer">
        <SkeletonBlock width={38} height={38} radius={9} />
        <SkeletonBlock width="auto" height={40} radius={9} style={{ flex: 1 }} />
      </div>
    </article>
  )
}

export function VacanciesSkeleton() {
  return (
    <>
      <Topbar title="Vacantes" subtitle="Encuentra oportunidades que impulsen tu futuro." />
      <div className="page page--wide" >
        <div className="vac-grid">
          <VacancyCardSkeleton />
          <VacancyCardSkeleton />
          <VacancyCardSkeleton />
          <VacancyCardSkeleton />
          <VacancyCardSkeleton />
          <VacancyCardSkeleton />
        </div>
      </div>
    </>
  )
}

function ApplicationRowSkeleton() {
  return (
    <div className="app-row">
      <SkeletonCircle size={46} />
      <div className="app-row-body">
        <SkeletonLine width="62%" height={15} />
        <SkeletonLine width="42%" height={12} style={{ marginTop: 8 }} />
      </div>
      <div className="app-row-actions">
        <SkeletonChip width={96} height={28} />
        <SkeletonBlock width={38} height={38} radius={9} />
      </div>
    </div>
  )
}

export function ApplicationsSkeleton() {
  return (
    <>
      <Topbar title="Mis postulaciones" subtitle="Sigue el estado de tus postulaciones." />
      <div className="page page--wide">
        <div className="panel">
          <div className="app-rows">
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
          </div>
        </div>
      </div>
    </>
  )
}

function FavoriteCardSkeleton() {
  return (
    <div className="vacancy-card">
      <div className="vacancy-card-top">
        <SkeletonLine width="46%" height={16} />
        <SkeletonLine width="18%" height={12} />
      </div>
      <SkeletonLine width="32%" height={14} style={{ marginTop: 12 }} />
      <SkeletonLine width="40%" height={13} style={{ marginTop: 8 }} />
      <SkeletonBlock width={140} height={36} radius={9} style={{ marginTop: 16 }} />
    </div>
  )
}

export function FavoritesSkeleton() {
  return (
    <>
      <Topbar title="Guardados" subtitle="Las vacantes que marcaste para después." />
      <div className="page">
        <div className="vacancy-list">
          <FavoriteCardSkeleton />
          <FavoriteCardSkeleton />
          <FavoriteCardSkeleton />
        </div>
      </div>
    </>
  )
}

export function VacancyDetailSkeleton() {
  return (
    <>
      <Topbar title="Vacantes" subtitle="Encuentra oportunidades que impulsen tu futuro." />
      <div className="page page--wide">
        <div className="split-view split-view--main-first">
          <div className="split-view-main">
            <div className="card pv-card vd-main">
              <div className="vd-head">
                <SkeletonCircle size={52} />
                <div className="vd-head-text">
                  <SkeletonLine width="70%" height={22} />
                  <SkeletonLine width="42%" height={14} style={{ marginTop: 10 }} />
                  <SkeletonLine width="58%" height={12} style={{ marginTop: 8 }} />
                </div>
              </div>
              <div className="vd-tags">
                <SkeletonChip width={72} />
                <SkeletonChip width={88} />
              </div>
              <SkeletonLine width="32%" height={18} style={{ marginTop: 24 }} />
              <SkeletonLine height={13} style={{ marginTop: 14 }} />
              <SkeletonLine height={13} style={{ marginTop: 7 }} />
              <SkeletonLine width="72%" height={13} style={{ marginTop: 7 }} />
            </div>
          </div>
          <aside className="split-view-aside">
            <div className="card pv-card">
              <SkeletonLine width="52%" height={18} />
              <SkeletonLine height={13} style={{ marginTop: 18 }} />
              <SkeletonLine width="80%" height={13} style={{ marginTop: 12 }} />
              <SkeletonLine width="64%" height={13} style={{ marginTop: 12 }} />
              <SkeletonLine width="72%" height={13} style={{ marginTop: 12 }} />
            </div>
            <div className="card pv-card">
              <SkeletonLine width="42%" height={18} />
              <SkeletonChip width={96} style={{ marginTop: 18 }} />
              <SkeletonChip width={110} style={{ marginTop: 10 }} />
              <SkeletonChip width={88} style={{ marginTop: 10 }} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

export function ProfileSkeleton() {
  return (
    <>
      <Topbar title="Mi Perfil" subtitle="Tu información y tu portafolio." />
      <div className="page page--wide">
        <div className="split-view">
          <aside className="split-view-aside">
            <div className="card pv-card pv-identity">
              <SkeletonCircle size={176} style={{ margin: '0 auto 20px' }} />
              <SkeletonLine width="70%" height={22} style={{ margin: '0 auto' }} />
              <SkeletonLine width="46%" height={14} style={{ margin: '10px auto 0' }} />
            </div>
            <div className="card pv-card">
              <SkeletonLine width="48%" height={18} />
              <SkeletonLine height={13} style={{ marginTop: 18 }} />
              <SkeletonLine width="84%" height={13} style={{ marginTop: 12 }} />
              <SkeletonLine width="64%" height={13} style={{ marginTop: 12 }} />
            </div>
          </aside>
          <div className="split-view-main">
            <div className="card pv-card">
              <SkeletonLine width="40%" height={18} />
              <div className="pv-grid" style={{ marginTop: 20 }}>
                <SkeletonBlock height={42} />
                <SkeletonBlock height={42} />
                <SkeletonBlock height={42} />
                <SkeletonBlock height={42} />
              </div>
            </div>
            <div className="card pv-card">
              <SkeletonLine width="36%" height={18} />
              <SkeletonBlock height={96} style={{ marginTop: 20 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function PortfolioSkeleton() {
  return (
    <div className="split-view">
      <aside className="split-view-aside">
        <div className="card pv-card pv-identity">
          <SkeletonCircle size={72} style={{ margin: '0 auto 20px' }} />
          <SkeletonLine width="60%" height={20} style={{ margin: '0 auto' }} />
        </div>
        <div className="card pv-card">
          <SkeletonLine width="52%" height={18} />
          <SkeletonBlock height={42} style={{ marginTop: 20 }} />
          <SkeletonBlock height={42} style={{ marginTop: 12 }} />
          <SkeletonBlock height={40} style={{ marginTop: 12 }} />
        </div>
      </aside>
      <div className="split-view-main">
        <SkeletonLine width="34%" height={20} />
        <div className="pf-list" style={{ marginTop: 20 }}>
          <div className="card pv-card pf-item">
            <SkeletonCircle size={40} />
            <div className="pf-item-body">
              <SkeletonLine width="60%" height={15} />
              <SkeletonLine width="44%" height={13} style={{ marginTop: 8 }} />
            </div>
          </div>
          <div className="card pv-card pf-item">
            <SkeletonCircle size={40} />
            <div className="pf-item-body">
              <SkeletonLine width="54%" height={15} />
              <SkeletonLine width="38%" height={13} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
