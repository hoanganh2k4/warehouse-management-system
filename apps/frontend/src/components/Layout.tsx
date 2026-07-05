import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        {/* TẠM THỜI truyền query rỗng + hàm rỗng — Task 05 sẽ xoá 2 props này
           khỏi Topbar hẳn và chuyển ô search vào ProductList.tsx */}
        <Topbar query="" onQueryChange={() => {}} />
        <Outlet />
      </div>
    </div>
  );
}
