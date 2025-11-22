import React, { useState, useEffect, useRef } from 'react';

function DatePicker({ label, value, onChange, placeholder, isOpen, onOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState(value || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef(null);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange?.(newDate);
    onClose?.();
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentMonth(new Date(newYear, currentMonth.getMonth()));
  };

  const handleButtonClick = () => {
    if (isOpen) onClose?.(); else onOpen?.();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="relative" ref={datePickerRef}>
      {label && <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>}
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white hover:border-purple-300 transition-all shadow-sm"
      >
        <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>
          {selectedDate ? formatDate(selectedDate) : (placeholder || 'Select date')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-purple-100 p-4 w-80">
          <div className="flex items-center justify-between gap-2 mb-4">
            <select
              value={currentMonth.getMonth()}
              onChange={handleMonthChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select
              value={currentMonth.getFullYear()}
              onChange={handleYearChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map(i => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth.getMonth() &&
                selectedDate.getFullYear() === currentMonth.getFullYear();
              const today = new Date();
              const isToday = today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`p-2 text-sm rounded-lg transition-all ${
                    isSelected ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-lg' :
                    isToday ? 'bg-purple-100 text-purple-600 font-bold' :
                    'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;