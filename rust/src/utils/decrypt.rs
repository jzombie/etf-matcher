include!("../__AUTOGEN__generated_password.rs");

// Re-export the methods as crate-only visibility under a namespace
pub(crate) mod password {
    pub(crate) use super::get_encrypted_password;
    pub(crate) use super::get_iv;
}
