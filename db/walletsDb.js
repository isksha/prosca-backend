// TODO : establish collection

const getWallet = async (podId) => {
    return {1: 2};
}

const getStatement = async (transaction_id, amount, date, user_id, pod_id, pod_iteration, start_date) => {
    // return User
}

const addPaymentMethod = async (payment_method_id) => {

}

const addMpesaPaymentMethod = async (mpesa_id, phone_no, payment_method_id) => {

}

const getWalletAmount = async (pod_id, iteration, amount) => {

}

const addBankAccountInfo = async (bank_account_id, account_id, account_name, routing_no, login_info, date_added, is_active, payment_method_id) => {

}

const changeBankAccountInfo = async (bank_account_id, account_id, account_name, routing_no, login_info, date_added, is_active, payment_method_id) => {

}

const addCardInfo = async(card_id, card_no, expiration_date, security_no, zip_code, date_added, is_active, payment_method_id) => {

}

const conchangeCardInfo = async(card_id, new_info) => {

}

module.exports = {
    getWallet,
    getStatement,
    addPaymentMethod,
    getWalletAmount,
    addBankAccountInfo,
    changeBankAccountInfo,
    addCardInfo,
    conchangeCardInfo,
    addMpesaPaymentMethod
};