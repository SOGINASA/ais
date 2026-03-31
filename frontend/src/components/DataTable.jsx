import React from 'react';

export const DataTable = ({ 
  columns, 
  data, 
  loading, 
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  deleteLabel,
}) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`text-left px-4 py-3 font-semibold text-gray-900 ${col.width || ''}`}>
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="text-center px-4 py-3 font-semibold text-gray-900">Действия</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-gray-500">
                  Загрузка...
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-gray-500">
                  Нет данных
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                          >
                            ✏️ Редактировать
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                          >
                            {typeof deleteLabel === 'function' ? deleteLabel(row) : (deleteLabel || '🗑️ Удалить')}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Страница {pagination.page} из {pagination.pages} (всего {pagination.total})
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors text-xs"
            >
              ← Предыдущая
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors text-xs"
            >
              Следующая →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
