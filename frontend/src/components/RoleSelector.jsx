import React from 'react';
import './RoleSelector.css';

const RoleSelector = ({ value, onChange, onConfirm, onCancel, isLoading, darkMode }) => {
  const handleRoleChange = (newValue) => {
    if (!isLoading) {
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
    <div className={`role-selector-overlay ${darkMode ? 'dark' : ''}`}>
      <div className="role-selector-container">
        <h3 className="role-selector-title">اختر نوع الحساب</h3>
        <p className="role-selector-description">كيف تريد استخدام المنصة؟</p>
        
        <div className="role-options">
          <div 
            className={`role-option ${value === 'client' ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
            onClick={() => handleRoleChange('client')}
            onKeyDown={(e) => handleKeyPress(e, 'client')}
            tabIndex={isLoading ? -1 : 0}
            aria-selected={value === 'client'}
            aria-disabled={isLoading}
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
            className={`role-option ${value === 'worker' ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
            onClick={() => handleRoleChange('worker')}
            onKeyPress={(e) => handleKeyPress(e, 'worker')}
            tabIndex={isLoading ? -1 : 0}
            aria-selected={value === 'worker'}
            aria-disabled={isLoading}
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

        <div className="role-selector-actions">
          <button 
            className="cancel-button" 
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button 
            className="confirm-button" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري المعالجة...' : 'تأكيد'}
          </button>
        </div>

        {isLoading && (
          <p className="role-selector-disabled-message">
            جاري إنشاء الحساب، يرجى الانتظار...
          </p>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;