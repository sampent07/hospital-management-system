import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, Clock, XCircle, Key } from 'lucide-react';
import { Authorization, Account } from '../types';
import { formatFacilityDateTime } from '../utils/formatTime';

interface AuthorizationPageProps {
  currentAccount: Account;
}

export const AuthorizationPage: React.FC<AuthorizationPageProps> = ({ currentAccount }) => {
  const isDoctor = currentAccount.role === 'DOCTOR';
  const isCoordinator = currentAccount.role === 'COORDINATOR';

  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form tạo ủy quyền
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [coordinatorId, setCoordinatorId] = useState<string>('acc-02-coord');
  const [scope, setScope] = useState<string>(
    'Hỗ trợ tiếp nhận bệnh nhân & Quyết định lộ trình khám thay mặt bác sĩ'
  );
  const [endedAt, setEndedAt] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAuthorizations = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/authorizations', {
        headers: { Authorization: 'Bearer mock-token' }
      });
      if (!res.ok) throw new Error('Không thể tải danh sách ủy quyền.');
      const data: Authorization[] = await res.json();
      setAuthorizations(data);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthorizations();
  }, [fetchAuthorizations]);

  const handleCreateAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/authorizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          coordinator_id: coordinatorId,
          scope: scope,
          ended_at: endedAt ? new Date(endedAt).toISOString() : null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi tạo giấy ủy quyền.');
      }

      setShowCreateModal(false);
      setSuccessMsg('Đã tạo giấy ủy quyền thành công! Đang chờ Thư ký tiếp nhận.');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAuthorizations();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAuthorization = async (authId: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/authorizations/${authId}/accept`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      });
      if (!res.ok) throw new Error('Không thể tiếp nhận ủy quyền.');
      setSuccessMsg('Bạn đã xác nhận tiếp nhận ủy quyền thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAuthorizations();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  const handleRevokeAuthorization = async (authId: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/authorizations/${authId}/revoke`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      });
      if (!res.ok) throw new Error('Không thể thu hồi ủy quyền.');
      setSuccessMsg('Đã thu hồi giấy ủy quyền!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAuthorizations();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Ủy Quyền Nghiệp Vụ Bác Sĩ &amp; Thư Ký</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình chuẩn hóa cho phép Bác sĩ ủy quyền phạm vi hỗ trợ và Thư ký tiếp nhận nhiệm vụ.
          </p>
        </div>

        {isDoctor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Ủy Quyền Cho Thư Ký</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Danh sách ủy quyền */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Đang tải danh sách ủy quyền...</span>
          </div>
        ) : authorizations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Hiện chưa có bản ghi ủy quyền nào được tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Bác Sĩ Ủy Quyền</th>
                  <th className="p-3.5">Thư Ký Được Ủy Quyền</th>
                  <th className="p-3.5">Phạm Vi Ủy Quyền</th>
                  <th className="p-3.5">Hiệu Lực Từ</th>
                  <th className="p-3.5">Hết Hạn</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {authorizations.map((auth) => (
                  <tr key={auth.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-800">{auth.doctorName}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{auth.coordinatorName}</td>
                    <td className="p-3.5 text-slate-600 max-w-sm">{auth.scope}</td>
                    <td className="p-3.5 text-slate-500">{formatFacilityDateTime(auth.startedAt)}</td>
                    <td className="p-3.5 text-slate-500">
                      {auth.endedAt ? formatFacilityDateTime(auth.endedAt) : 'Vô thời hạn'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        auth.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : auth.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {auth.status === 'ACTIVE' ? 'Đang hiệu lực' : auth.status === 'PENDING' ? 'Chờ tiếp nhận' : auth.status === 'REVOKED' ? 'Đã thu hồi' : 'Đã hết hạn'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      {isCoordinator && auth.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptAuthorization(auth.id)}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Tiếp nhận</span>
                        </button>
                      )}
                      {isDoctor && auth.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeAuthorization(auth.id)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                        >
                          Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tạo ủy quyền mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Thiết Lập Giấy Ủy Quyền Cho Thư Ký</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuthorization} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Chọn Thư ký phòng khám</label>
                <select
                  value={coordinatorId}
                  onChange={(e) => setCoordinatorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="acc-02-coord">Nguyễn Thị Mai (Điều phối / Thư ký)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phạm vi ủy quyền</label>
                <textarea
                  rows={3}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Thời gian hết hạn</label>
                <input
                  type="datetime-local"
                  value={endedAt}
                  onChange={(e) => setEndedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Ban Hành Ủy Quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
