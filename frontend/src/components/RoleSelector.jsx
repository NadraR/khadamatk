import React from 'react';
import './RoleSelector.css';

const RoleSelector = ({ value, onChange, disabled = false }) => {
  const handleRoleChange = (newValue) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  const handleKeyPress = (e, role) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleChange(role);
    }
  };

  return (
    <div className="role-selector-container">
      <h3 className="role-selector-title">اختر نوع الحساب</h3>
      <p className="role-selector-description">كيف تريد استخدام المنصة؟</p>
      
      <div className="role-options">
        <div 
          className={`role-option ${value === 'client' ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => handleRoleChange('client')}
          onKeyDown={(e) => handleKeyPress(e, 'client')}
          tabIndex={disabled ? -1 : 0}
          aria-selected={value === 'client'}
          aria-disabled={disabled}
          role="radio"
        >
          <div className="role-option-content">
            <div className="role-icon">👤</div>
            <div className="role-text">
              <h4 className="role-title">عميل</h4>
              <p className="role-description">أبحث عن خدمات وأحتاج مساعدة</p>
            </div>
            <div className="radio-indicator">
              <div className="radio-circle"></div>
            </div>
          </div>
        </div>

        <div 
          className={`role-option ${value === 'worker' ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => handleRoleChange('worker')}
          onKeyPress={(e) => handleKeyPress(e, 'worker')}
          tabIndex={disabled ? -1 : 0}
          aria-selected={value === 'worker'}
          aria-disabled={disabled}
          role="radio"
        >
          <div className="role-option-content">
            <div className="role-icon">🔧</div>
            <div className="role-text">
              <h4 className="role-title">مزود خدمة</h4>
              <p className="role-description">أقدم خدمات وأريد عرض مهاراتي</p>
            </div>
            <div className="radio-indicator">
              <div className="radio-circle"></div>
            </div>
          </div>
        </div>
      </div>

      {disabled && (
        <p className="role-selector-disabled-message">
            لا يمكن تغيير نوع الحساب أثناء التحميل
        </p>
      )}
    </div>
  );
};

export default RoleSelector;