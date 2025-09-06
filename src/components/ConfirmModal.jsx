import { Modal } from "antd";
import { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modal, setModal] = useState({
    open: false,
    title: "",
    content: "",
    onOk: null,
  });

  const confirm = useCallback(({ title, content, onOk }) => {
    setModal({
      open: true,
      title,
      content,
      onOk,
    });
  }, []);

  const handleOk = () => {
    modal.onOk?.();
    setModal((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={modal.open}
        title={modal.title}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy">
        {modal.content}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
