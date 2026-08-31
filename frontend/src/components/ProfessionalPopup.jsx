import React, {
  createContext,
  useContext,
  useState,
} from "react";

import "./ProfessionalPopup.css";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const closePopup = (result = true) => {
    if (popup?.resolve) {
      popup.resolve(result);
    }

    setPopup(null);
  };

  const showPopup = ({
    type = "info",
    title = "Notice",
    message = "",
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = false,
    warning = "",
  }) => {
    return new Promise((resolve) => {
      setPopup({
        type,
        title,
        message,
        confirmText,
        cancelText,
        showCancel,
        warning,
        resolve,
      });
    });
  };

  const showAlert = ({
    type = "info",
    title = "Notice",
    message = "",
    confirmText = "OK",
  }) => {
    return showPopup({
      type,
      title,
      message,
      confirmText,
      showCancel: false,
    });
  };

  const showConfirm = ({
    type = "warning",
    title = "Are you sure?",
    message = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    warning = "",
  }) => {
    return showPopup({
      type,
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true,
      warning,
    });
  };

  return (
    <PopupContext.Provider
      value={{
        showPopup,
        showAlert,
        showConfirm,
        closePopup,
      }}
    >
      {children}

      {popup && (
        <div
          className="professional-popup-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              popup.showCancel
            ) {
              closePopup(false);
            }
          }}
        >
          <div
            className={`professional-popup professional-popup-${popup.type}`}
            role="dialog"
            aria-modal="true"
          >
            {/* TOP GLOW */}
            <div className="professional-popup-top-glow" />

            {/* CLOSE */}
            <button
              type="button"
              className="professional-popup-close"
              onClick={() =>
                closePopup(
                  popup.showCancel ? false : true
                )
              }
              aria-label="Close popup"
            >
              ×
            </button>

            {/* HEADER */}
            <div className="professional-popup-header">
              <div
                className={`professional-popup-icon ${popup.type}`}
              >
                {popup.type === "success" && "✓"}

                {popup.type === "error" && "!"}

                {popup.type === "warning" && (
                  <span className="warning-symbol">
                    !
                  </span>
                )}

                {popup.type === "info" && "i"}
              </div>

              <div className="professional-popup-heading">
                <h2 className="professional-popup-title">
                  {popup.title}
                </h2>

                <p className="professional-popup-message">
                  {popup.message}
                </p>
              </div>
            </div>

            {/* WARNING BOX */}
            {popup.warning && (
              <div className="professional-popup-warning-box">
                <div className="professional-warning-title">
                  WARNING:
                </div>

                <div className="professional-warning-text">
                  {popup.warning}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="professional-popup-actions">
              {popup.showCancel && (
                <button
                  type="button"
                  className="professional-popup-cancel"
                  onClick={() => closePopup(false)}
                >
                  {popup.cancelText}
                </button>
              )}

              <button
                type="button"
                className={`professional-popup-confirm ${popup.type}`}
                onClick={() => closePopup(true)}
              >
                {popup.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);

  if (!context) {
    throw new Error(
      "usePopup must be used inside PopupProvider"
    );
  }

  return context;
}