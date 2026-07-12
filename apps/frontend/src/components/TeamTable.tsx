import type { TeamMember } from '../types';
import { AlertIcon, UsersIcon } from './icons';

type TeamTableProps = {
  members: TeamMember[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

function formatDate(value: string) {
  try {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return value;
  }
}

export function TeamTable({ members, totalCount, loading, error }: TeamTableProps) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td><span className="skeleton" style={{ width: '160px' }} /></td>
                <td><span className="skeleton" style={{ width: '100px' }} /></td>
                <td><span className="skeleton" style={{ width: '180px' }} /></td>
                <td><span className="skeleton" style={{ width: '90px' }} /></td>
                <td><span className="skeleton" style={{ width: '90px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-error">
        <AlertIcon size={22} />
        <p className="state-title">Không tải được danh sách nhân sự</p>
        <p className="state-body">{error}. Kiểm tra lại API và thử lại.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="state-panel">
        <UsersIcon size={22} />
        <p className="state-title">Chưa có nhân sự nào</p>
        <p className="state-body">Danh sách nhân viên sẽ hiển thị ở đây khi có dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Username</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tham gia</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="product-name">{member.fullName ?? member.username}</td>
              <td className="muted-cell">{member.username}</td>
              <td className="muted-cell">{member.email ?? '—'}</td>
              <td>
                <span className="chip">{member.role.name}</span>
              </td>
              <td className="muted-cell">{formatDate(member.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}