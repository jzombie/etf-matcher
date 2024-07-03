use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use flate2::write::GzEncoder;
use flate2::Compression;
use hmac::{Hmac, NewMac};
use pbkdf2::pbkdf2;
use sha2::Sha256;
use dotenv::dotenv;
use rand::Rng;
use std::env;
use std::fs::File;
use std::io::{Read, Write};
use std::iter;
use std::convert::TryInto;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

fn parse_env_variable_to_bytes(env_var: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let bytes: Result<Vec<u8>, _> = env_var.split(',')
        .map(|s| s.trim().parse::<u8>())
        .collect();
    bytes.map_err(|e| e.into())
}

fn encrypt_and_compress_file(input_file: &str, output_file: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Read the input file
    let mut data = Vec::new();
    File::open(input_file)?.read_to_end(&mut data)?;

    // Compress the data
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(&data)?;
    let compressed_data = encoder.finish()?;
    println!("Compressed data length: {}", compressed_data.len());

    // Load environment variables from .env file
    dotenv().ok();

    // Retrieve the password, key, and IV from environment variables
    let encrypted_password = parse_env_variable_to_bytes(&env::var("ENCRYPTED_PASSWORD")?)?;
    let key: [u8; 32] = parse_env_variable_to_bytes(&env::var("KEY")?)?.try_into().expect("Invalid key length");
    let iv: [u8; 16] = parse_env_variable_to_bytes(&env::var("IV")?)?.try_into().expect("Invalid IV length");

    println!("Encrypted password: {:?}", encrypted_password);
    println!("Key: {:?}", key);
    println!("IV: {:?}", iv);

    // Generate a random salt
    let mut salt = [0u8; 16];
    rand::thread_rng().fill(&mut salt);
    println!("Salt: {:?}", salt);

    // Derive a key from the password using PBKDF2
    let mut derived_key = [0u8; 32];
    pbkdf2::<Hmac<Sha256>>(&encrypted_password, &salt, 10000, &mut derived_key);
    println!("Derived key: {:?}", derived_key);

    // Create cipher
    let cipher = Aes256Cbc::new_from_slices(&derived_key, &iv)?;

    // Pad data to be multiple of 16
    let padding_length = 16 - compressed_data.len() % 16;
    let mut padded_data = compressed_data.clone();
    padded_data.extend(std::iter::repeat(padding_length as u8).take(padding_length));
    println!("Padded data length: {}", padded_data.len());

    // Encrypt data
    let encrypted_data = cipher.encrypt_vec(&padded_data);
    println!("Encrypted data length: {}", encrypted_data.len());

    // Write the salt, IV, and encrypted data to the output file
    let mut output = File::create(output_file)?;
    output.write_all(&salt)?;
    output.write_all(&iv)?;
    output.write_all(&encrypted_data)?;

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <input_file> <output_file>", args[0]);
        std::process::exit(1);
    }
    encrypt_and_compress_file(&args[1], &args[2])?;
    Ok(())
}
