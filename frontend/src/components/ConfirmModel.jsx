import React from "react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const icon =
    type === "success"
      ? "✓"
      : type === "warning"
      ? "!"
      : "×";

  return (
    <div
      style={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        style={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          style={{
            ...styles.icon,
            ...(type === "success"
              ? styles.successIcon
              : type === "warning"
              ? styles.warningIcon
              : styles.dangerIcon),
          }}
        >
          {icon}
        </div>

        <h2 style={styles.title}>{title}</h2>

        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            style={{
              ...styles.confirmButton,
              ...(type === "success"
                ? styles.successButton
                : type === "warning"
                ? styles.warningButton
                : styles.dangerButton),
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(2, 10, 22, 0.72)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    animation: "quizNovaModalFade 0.2s ease",
  },

  modal: {
    width: "100%",
    maxWidth: "460px",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid rgba(105, 210, 255, 0.20)",
    background:
      "linear-gradient(145deg, rgba(13, 52, 82, 0.98), rgba(5, 24, 44, 0.99))",
    boxShadow:
      "0 30px 100px rgba(0, 0, 0, 0.55), 0 0 50px rgba(0, 174, 255, 0.10)",
    textAlign: "center",
    animation: "quizNovaModalScale 0.22s ease",
  },

  icon: {
    width: "68px",
    height: "68px",
    margin: "0 auto 18px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: 900,
  },

  dangerIcon: {
    background: "rgba(255, 76, 91, 0.12)",
    border: "1px solid rgba(255, 90, 105, 0.22)",
    color: "#ff7d88",
    boxShadow: "0 10px 35px rgba(255, 60, 80, 0.12)",
  },

  warningIcon: {
    background: "rgba(255, 190, 60, 0.12)",
    border: "1px solid rgba(255, 190, 60, 0.22)",
    color: "#ffd36b",
    boxShadow: "0 10px 35px rgba(255, 190, 60, 0.10)",
  },

  successIcon: {
    background: "rgba(30, 210, 155, 0.12)",
    border: "1px solid rgba(30, 210, 155, 0.22)",
    color: "#62e5bd",
    boxShadow: "0 10px 35px rgba(30, 210, 155, 0.10)",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "23px",
    fontWeight: 850,
    letterSpacing: "-0.4px",
  },

  message: {
    margin: "10px auto 0",
    maxWidth: "370px",
    color: "#91abc2",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "26px",
  },

  cancelButton: {
    minWidth: "120px",
    padding: "12px 18px",
    borderRadius: "11px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#c8d7e5",
    fontSize: "14px",
    fontWeight: 750,
    cursor: "pointer",
  },

  confirmButton: {
    minWidth: "145px",
    padding: "12px 18px",
    borderRadius: "11px",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  dangerButton: {
    background: "linear-gradient(135deg, #ff5366, #e52d45)",
    boxShadow: "0 10px 25px rgba(255, 60, 80, 0.20)",
  },

  warningButton: {
    background: "linear-gradient(135deg, #ffca55, #f08a25)",
    boxShadow: "0 10px 25px rgba(255, 170, 50, 0.20)",
  },

  successButton: {
    background: "linear-gradient(135deg, #20d5a2, #12a978)",
    boxShadow: "0 10px 25px rgba(30, 210, 155, 0.20)",
  },
};