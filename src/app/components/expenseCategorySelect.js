// components/ExpenseCategorySelect.jsx
import React from 'react';
import { useTranslations } from "next-intl";

const ExpenseCategorySelect = ({ value, onChange, name, id, className, includeAllOption = false }) => {
const t = useTranslations('');

  const categories = [
    { value: 'RAW_MATERIALS', translationKey: 'expense.categories.raw_materials' },
    { value: 'PROCESSING', translationKey: 'expense.categories.processing' },
    { value: 'FACILITY', translationKey: 'expense.categories.facility' },
    { value: 'ADMIN', translationKey: 'expense.categories.admin' },
    { value: 'DISTRIBUTION', translationKey: 'expense.categories.distribution' },
    { value: 'COMPLIANCE', translationKey: 'expense.categories.compliance' }
  ];

  return (
    <select
      name={name || 'category'}
      id={id || 'category'}
      value={value || ''}
      onChange={onChange}
      className={className || 'border p-2 w-full mb-3'}
    >
      {includeAllOption && (
        <option value="">{t('expense.categories.all_categories')}</option>
      )}
      
      {categories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {t(cat.translationKey)}
        </option>
      ))}
    </select>
  );
};

export default ExpenseCategorySelect;