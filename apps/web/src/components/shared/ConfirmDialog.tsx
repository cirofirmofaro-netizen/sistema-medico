import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200',
        };
      case 'warning':
        return {
          icon: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          border: 'border-amber-200',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200',
        };
      default:
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200',
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Dialog */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${styles.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className={`w-6 h-6 mr-3 ${styles.icon}`} />
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-600">
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmando...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
