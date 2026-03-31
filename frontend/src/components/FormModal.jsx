import React, { useEffect, useState } from 'react';

export const FormModal = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        const defaults = {};
        fields.forEach((f) => {
          defaults[f.name] = f.defaultValue || '';
        });
        setFormData(defaults);
      }
    }
  }, [isOpen, initialData, fields]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const baseClass =
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

    if (field.type === 'select') {
      return (
        <select
          value={formData[field.name] ?? ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          required={field.required}
          className={baseClass}
        >
          <option value="">Выберите...</option>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={formData[field.name] ?? ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          rows={3}
          className={baseClass}
        />
      );
    }

    return (
      <input
        type={field.type || 'text'}
        value={formData[field.name] ?? ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
        className={baseClass}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
