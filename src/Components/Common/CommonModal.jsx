import React from "react";
import { SbAdminSvg } from "./Svgs/ActionsSvg";

const CommonModal = ({
  open,
  onClose,
  title,
  subTitle,
  showHeader = true,
  footer,
  children,
  maxWidth = "max-w-[450px]",
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${maxWidth} rounded-[20px] bg-white shadow-xl border border-gray-200`}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-3 py-3 border-b">
            <div>
              <p className="text-sm font-semibold">{title}</p>
              {subTitle && (
                <p className="text-xs text-gray-500">{subTitle}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              {SbAdminSvg.crossIcon}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-4 py-3 border-t bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonModal;