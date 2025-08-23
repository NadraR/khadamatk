import React from 'react';

const RoleSelector = ({ value, onChange }) => {
  return (
    <div className="role-selector">
      <label>
        <input
          type="radio"
          name="role"
          value="client"
          checked={value === 'client'}
          onChange={() => onChange('client')}
        />
        عميل
      </label>
      <label>
        <input
          type="radio"
          name="role"
          value="worker"
          checked={value === 'worker'}
          onChange={() => onChange('worker')}
        />
        مقدم خدمة
      </label>
    </div>
  );
};

export default RoleSelector;
