import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="app-main">
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
