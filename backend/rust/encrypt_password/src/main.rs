use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use rand::Rng;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

fn encrypt_password(password: &str, key: &[u8; 32], iv: &[u8; 16]) -> Vec<u8> {
    let cipher = Aes256Cbc::new_from_slices(key, iv).unwrap();
    let ciphertext = cipher.encrypt_vec(password.as_bytes());
    ciphertext
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: {} <password>", args[0]);
        std::process::exit(1);
    }
    let password = &args[1];

    // Generate a random key and IV
    let key: [u8; 32] = rand::thread_rng().gen();
    let iv: [u8; 16] = rand::thread_rng().gen();

    // Encrypt the password
    let encrypted_password = encrypt_password(password, &key, &iv);

    // Output the encrypted password, key, and IV to stdout
    println!("Key: {:?}", key);
    println!("IV: {:?}", iv);
    println!("Encrypted Password: {:?}", encrypted_password);

    Ok(())
}
