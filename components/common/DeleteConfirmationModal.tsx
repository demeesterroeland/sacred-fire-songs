'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false,
}: DeleteConfirmationModalProps) {
    const [render, setRender] = useState(false);

    // Synchronize rendering state with isOpen prop without triggering cascading renders
    if (isOpen && !render) {
        setRender(true);
    }

    const onTransitionEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    return (
        <div
            onTransitionEnd={onTransitionEnd}
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${isOpen ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none pointer-events-none'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 transition-opacity"
                onClick={!isDeleting ? onClose : undefined}
            />

            {/* Modal Card */}
            <div
                className={`bg-white dark:bg-slate-900 border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-900/20 transform transition-all duration-200 relative z-10 mx-4 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
            >
                <div className="flex items-center gap-4 mb-6 text-red-500">
                    <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-red-400 text-sm">This action cannot be undone.</p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-3 rounded-xl font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Yes, Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
