use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use flate2::write::GzEncoder;
use flate2::Compression;
use hmac::{Hmac, NewMac};
use pbkdf2::pbkdf2;
use rand::Rng;
use sha2::Sha256;
use std::fs::File;
use std::io::{Read, Write};
use std::iter;
use hex_literal::hex;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

fn encrypt_and_compress_file(input_file: &str, output_file: &str, password: &str) -> Result<(), Box<dyn std::error::Error>> {
    // Read the input file
    let mut data = Vec::new();
    File::open(input_file)?.read_to_end(&mut data)?;

    // Compress the data
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(&data)?;
    let compressed_data = encoder.finish()?;
    println!("Compressed data length: {}", compressed_data.len());

    // Generate a random salt
    let salt: [u8; 16] = rand::thread_rng().gen();
    println!("Salt: {:?}", salt);

    // TODO: Don't hardcode the key!
    // Derive a key from the password using PBKDF2
    // let mut key = [0u8; 32];
    let mut key = hex!("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
    pbkdf2::<Hmac<Sha256>>(password.as_bytes(), &salt, 10000, &mut key);
    println!("Derived key: {:?}", key);

    // Generate a random IV
    let iv: [u8; 16] = rand::thread_rng().gen();
    println!("IV: {:?}", iv);

    // Create cipher
    let cipher = Aes256Cbc::new_from_slices(&key, &iv)?;

    // Pad data to be multiple of 16
    let padding_length = 16 - compressed_data.len() % 16;
    let mut padded_data = compressed_data.clone();
    padded_data.extend(iter::repeat(padding_length as u8).take(padding_length));
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
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 4 {
        eprintln!("Usage: {} <input_file> <output_file> <password>", args[0]);
        std::process::exit(1);
    }
    encrypt_and_compress_file(&args[1], &args[2], &args[3])?;
    Ok(())
}
