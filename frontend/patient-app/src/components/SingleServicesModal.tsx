import React, { useState } from 'react';
import {
  X,
  ListChecks,
  CalendarCheck,
  ChevronRight,
  Layers
} from 'lucide-react';
import { SingleServiceItem, ServiceCategoryGroup } from '../types';
import { PatientBasicInfo } from './PackageConsultationModal';

interface SingleServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientInfo: PatientBasicInfo;
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  onApplyCombo?: (serviceIds: string[]) => void;
  onClearAll: () => void;
  onProceedToBooking: () => void;
  servicesList: SingleServiceItem[];
  categories: ServiceCategoryGroup[];
  quickCombos?: { id: string; name: string; desc: string; serviceIds: string[] }[];
}

export const SingleServicesModal: React.FC<SingleServicesModalProps> = ({
  isOpen,
  onClose,
  selectedServiceIds,
  onToggleService,
  onClearAll,
  onProceedToBooking,
  servicesList,
  categories,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const displayCategories =
    activeCategoryFilter === 'ALL'
      ? categories
      : categories.filter((c) => c.id === activeCategoryFilter);

  const selectedServices = servicesList.filter((s) => selectedServiceIds.includes(s.id));
  const singleTotalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header Cửa Sổ: Đã bỏ họ tên, SĐT, BHYT trùng lặp */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/90">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <ListChecks className="w-3 h-3 text-blue-600" />
                <span>Cửa Sổ Chọn Dịch Vụ Khám Lẻ</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Phân Theo Chuyên Khoa</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Danh Mục Dịch Vụ Khám Lẻ Theo Chuyên Khoa
            </h3>
            <p className="text-xs text-slate-500">
              Chọn các dịch vụ theo từng mục chuyên khoa dưới đây để đăng ký lịch khám.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Cửa Sổ: Cuộn nội dung */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          
          {/* CÁC MỤC CHUYÊN KHOA LỚN (RĂNG, DẠ DÀY, XƯƠNG...) - THU NHỎ GỌN GÀNG */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Mục Chuyên Khoa:</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-600 font-bold">
                  Đã chọn {selectedServiceIds.length} dịch vụ
                </span>
                {selectedServiceIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[11px] text-rose-500 hover:text-rose-700 underline cursor-pointer"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}
              </div>
            </div>

            {/* Lưới các nút Mục Chuyên Khoa thu gọn */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {/* Nút Xem Tất Cả */}
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  activeCategoryFilter === 'ALL'
                    ? 'border-blue-600 bg-blue-50/90 shadow-2xs ring-1 ring-blue-300'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">🌟</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Tất Cả</div>
                    <div className="text-[10px] text-slate-400">{servicesList.length} DV</div>
                  </div>
                </div>
              </button>

              {/* Từng chuyên khoa: Răng, Dạ dày, Xương... */}
              {categories.map((cat) => {
                const isCatActive = activeCategoryFilter === cat.id;
                const countInCat = servicesList.filter((s) => s.categoryId === cat.id).length;
                const countSelectedInCat = servicesList.filter(
                  (s) => s.categoryId === cat.id && selectedServiceIds.includes(s.id)
                ).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isCatActive
                        ? 'border-blue-600 bg-blue-50/90 shadow-2xs ring-1 ring-blue-300'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{cat.shortName}</div>
                        <div className="text-[10px] text-slate-400">{countInCat} DV</div>
                      </div>
                    </div>
                    {countSelectedInCat > 0 && (
                      <span className="text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white shrink-0 ml-0.5">
                        {countSelectedInCat}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DANH SÁCH DỊCH VỤ - CÁC Ô ĐƯỢC THU NHỎ GỌN GÀNG */}
          <div className="space-y-2.5">
            {displayCategories.map((cat) => {
              const servicesInCat = servicesList.filter((s) => s.categoryId === cat.id);
              if (servicesInCat.length === 0) return null;

              const countSelected = servicesInCat.filter((s) => selectedServiceIds.includes(s.id)).length;
              const allChecked = countSelected === servicesInCat.length;

              const handleToggleCategory = () => {
                if (allChecked) {
                  servicesInCat.forEach((s) => {
                    if (selectedServiceIds.includes(s.id)) onToggleService(s.id);
                  });
                } else {
                  servicesInCat.forEach((s) => {
                    if (!selectedServiceIds.includes(s.id)) onToggleService(s.id);
                  });
                }
              };

              return (
                <div
                  key={cat.id}
                  className="p-3 bg-slate-50/70 rounded-2xl border border-blue-200/80 space-y-2"
                >
                  {/* Header của Mục Lớn */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{cat.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{cat.name}</h5>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleCategory}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        allChecked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {allChecked ? '✓ Đã chọn hết' : `Chọn cả mục (${servicesInCat.length})`}
                    </button>
                  </div>

                  {/* Lưới các ô chọn dịch vụ - THU NHỎ GỌN GÀNG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {servicesInCat.map((service) => {
                      const isChecked = selectedServiceIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => onToggleService(service.id)}
                          className={`p-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50/90 shadow-2xs ring-1 ring-blue-200'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate leading-snug">
                                {service.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="bg-slate-100 px-1 py-0.2 rounded text-slate-600 font-medium">
                                  {service.roomNumber}
                                </span>
                                {service.preparationNote && (
                                  <span className="truncate max-w-[160px] text-slate-400 hidden sm:inline">
                                    • {service.preparationNote}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <strong className="text-blue-700 font-bold text-xs shrink-0 whitespace-nowrap">
                            {service.price.toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Cửa Sổ: Đã bỏ nút "Đóng / Quay Lại", giữ thông tin đã chọn + nút Tiến Hành Đặt Lịch */}
        <div className="p-3.5 px-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-500">Đã chọn: </span>
            <strong className="text-slate-900 font-bold">{selectedServiceIds.length} dịch vụ</strong>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-500">Tổng chi phí: </span>
            <strong className="text-blue-700 text-sm font-black">
              {singleTotalPrice.toLocaleString('vi-VN')} VNĐ
            </strong>
          </div>

          <button
            type="button"
            disabled={selectedServiceIds.length === 0}
            onClick={() => {
              onProceedToBooking();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Tiến Hành Đặt Lịch Khám Lẻ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
