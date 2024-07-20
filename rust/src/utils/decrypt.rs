include!("../__AUTOGEN__generated_password.rs");

// Re-export the methods as crate-only visibility under a namespace
pub(crate) mod password {
    pub(crate) use super::get_encrypted_password;
    pub(crate) use super::get_iv;

    use hmac::Hmac;
    use pbkdf2::pbkdf2;
    use sha2::Sha256;
    use aes::Aes256;
    use block_modes::Cbc;
    use block_modes::block_padding::Pkcs7;
    use wasm_bindgen::JsValue;

    pub(crate) fn decrypt_password(encrypted_password: &[u8], salt: &[u8]) -> Result<[u8; 32], JsValue> {
        // Derive the decryption key
        let mut key = [0u8; 32];
        pbkdf2::<Hmac<Sha256>>(encrypted_password, salt, 10000, &mut key);
        Ok(key)
    }

    pub(crate) type Aes256Cbc = Cbc<Aes256, Pkcs7>;
}
