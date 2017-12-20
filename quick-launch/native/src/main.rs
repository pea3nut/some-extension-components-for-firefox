use std::env;
use std::process::Command;
use std::os::windows::process::CommandExt;
use winapi::winbase;
use std::io::{self, Read, Write};
use std::io::Cursor;

extern crate byteorder;
use byteorder::{NativeEndian, ReadBytesExt, WriteBytesExt};

#[macro_use]
extern crate json;
extern crate winapi;

fn main() {
    let stdin_str = get_stdin(0);
    let stdin_json = json::parse(&stdin_str).unwrap();

    match stdin_json["type"].as_str() {
        Some("open_native_app") => {
            open_native_app(stdin_json["data"]["target"].as_str().unwrap());
        }
        _ => panic!("unknown json: {}", stdin_str),
    };

    send_stdout(&json::stringify(object!{
        "errcode" => 0,
        "errmsg"  => "ok",
    }));
}

fn open_native_app(target_name: &str) {
    let name2path = object!{
        "mspaint"   => "\\System32\\mspaint.exe",
        "calc"      => "\\System32\\calc.exe",
        "notepad"   => "\\System32\\notepad.exe",
        "explorer"  => array!["\\explorer.exe",","]
    };
    let windows_path_key = "windir";

    let app_path = match name2path[target_name] {
        json::JsonValue::String(ref str) => str.as_str(),
        json::JsonValue::Short(ref str) => str.as_str(),
        json::JsonValue::Array(ref arr) => arr[0].as_str().unwrap(),
        _ => panic!("name2path option error! {:?}", name2path[target_name]),
    };
    let mut app_args = Vec::new();
    match name2path[target_name] {
        json::JsonValue::Array(ref arr) => {
            let mut iter = arr[1..].into_iter();
            loop {
                match iter.next() {
                    Some(json_value) => app_args.push(json_value.as_str().unwrap()),
                    None => break,
                };
            }
        }
        _ => {}
    };

    let windows_path = match env::var(windows_path_key) {
        Ok(val) => val,
        Err(e) => panic!("Cannot get var {}: {}", windows_path_key, e),
    };

    Command::new(windows_path + app_path)
        .creation_flags(winbase::CREATE_BREAKAWAY_FROM_JOB)
        .args(&app_args)
        .spawn()
        .expect("failed to execute child");
}
fn send_stdout(message: &str) {
    let mut stdout = io::stdout();

    let message_length = message.len() as u32;
    let message_length_bytes: [u8; 4] = u32_to_u8(message_length);

    stdout.write(&message_length_bytes).unwrap();
    stdout.write(message.as_bytes()).unwrap();

    stdout.flush().unwrap();
}
fn get_stdin(len: usize) -> String {
    let mut stdin = io::stdin();

    let mut stdin_len: u32;
    if len == 0 {
        let mut stdin_len_byte = [0u8; 4];
        stdin.read_exact(&mut stdin_len_byte).unwrap();
        stdin_len = u8_to_u32(stdin_len_byte);
    } else {
        stdin_len = len as u32;
    };

    let mut byte = [0u8; 1];
    let mut data: Vec<u8> = Vec::new();

    while stdin_len > 0 {
        stdin_len = stdin_len - 1;
        io::stdin().read_exact(&mut byte).unwrap();
        for elt in byte.iter() {
            data.push(*elt);
        }
    }

    return String::from_utf8(data).unwrap();
}
fn u32_to_u8(u32x1: u32) -> [u8; 4] {
    const SIZE: usize = 4;
    let mut u8x4 = [0u8; SIZE];
    let mut buffer = vec![];
    buffer.write_u32::<NativeEndian>(u32x1).unwrap();

    let mut index = 0;
    while index < SIZE {
        u8x4[index] = buffer[index];
        index = index + 1;
    }
    return u8x4;
}
fn u8_to_u32(u8x4: [u8; 4]) -> u32 {
    let mut rdr = Cursor::new(&u8x4);
    return rdr.read_u32::<NativeEndian>().unwrap();
}
