import { Modal } from 'antd';


export const DepositForm = ({ onChange }) => {
  return (
    <form className="uk-form-stacked deposit-form">
      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="form-stacked-text">Deposit Amount (ETH)</label>
        <div className="uk-form-controls">
          <input onChange={onChange} name="depositAmount" className="uk-input deposit-amount" id="form-stacked-text" type="text" placeholder="0.05" />
        </div>
      </div>
      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="form-stacked-text">Backup Wallet Address</label>
        <div className="uk-form-controls">
          <input className="uk-input backup-address" onChange={onChange} name="backupAddress" id="form-stacked-text" type="text" maxLength={42} placeholder="0x12erf...." />
        </div>
      </div>
    </form>
  )
}

export const WithdrawForm = ({ onChange }) => {
  return (
    <form className="uk-form-stacked withdraw-form">
      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="form-stacked-text">
          Withdraw Amount (ETH) (Optional)
          </label>
        <label className="uk-form-label uk-text-muted" htmlFor="form-stacked-text">Leave blank if you wish
        to do
                      a full withdrawal</label>
        <div className="uk-form-controls">
          <input className="uk-input withdraw-amount" onChange={onChange} name="withdrawAmount" id="form-stacked-text" min={0} step="any" type="number" placeholder />
        </div>
      </div>
    </form>
  )
}

export const UpdateBackup = ({ onChange }) => {
  return (
    <form className="uk-form-stacked withdraw-form">
      <div className="uk-margin">
        <label className="uk-form-label" htmlFor="form-stacked-text">
          Update Backup address
          </label>
        <label className="uk-form-label uk-text-muted" htmlFor="form-stacked-text">Enter a new backup address</label>
        <div className="uk-form-controls">
          <input className="uk-input withdraw-amount" onChange={onChange} name="updateBackup" id="form-stacked-text" type="text" placeholder="0x..." />
        </div>
      </div>
    </form>
  )
}


const SFPModal = ({ loading, title, buttonText, action, visible, onOk, onCancel, children }) => {
  return (
    <Modal
      title={
        <h2 className="uk-modal-title">
          {title}
        </h2>}
      visible={visible}
      footer={[
        <button className="uk-button uk-button-default uk-modal-close" key="back" onClick={onCancel}>
          Cancel
        </button>,
        <button disabled={loading} className="uk-button uk-button-primary deposit-button" key="submit" type="primary" loading={loading} onClick={onOk}>
          {loading ? 'Processing...' : `${buttonText}`}
        </button>,
      ]}
    >
      <div>
        <div className="uk-modal-body">
          {children}
        </div>
      </div>
    </Modal>
  )
}

export default SFPModal;
