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
extern crate nfd;
extern crate regex;use regex::Regex;


fn main() {
    let stdin_str = get_stdin(0);
    // If you want test code, the stdin_str should like this:
    // let stdin_str = r#"
    //     {
    //         "type":"open_path",
    //         "data":{
    //             "path":"C:\\Users\\mozilla\\Desktop\\火狐截图20170918143357424.png",
    //             "args":[]
    //         }
    //     }
    // "#;
    let stdin_json = json::parse(&stdin_str).unwrap();
    
    match stdin_json["type"].as_str() {
        Some("open_path") => {
            let mut args:Vec<&str> =Vec::new();
            match stdin_json["data"]["args"]{
                json::JsonValue::Array(ref arr) => {
                    for item in arr.iter() {
                        args.push(
                            item.as_str().unwrap()
                        );
                    };
                },
                _ =>{},
            };
            open_path(
                stdin_json["data"]["path"].as_str().unwrap(),
                args
            );
            send_stdout(&json::stringify(object!{
                    "errcode" => 0,
                    "errmsg"  => "ok",
            }));
            
        },
        Some("select_file") => {
            let result = nfd::open_file_dialog(None, None).unwrap_or_else(|e| {
                panic!(e);
            });

            match result {
                nfd::Response::Okay(file_path) => send_stdout(&json::stringify(object!{
                    "errcode" => 0,
                    "errmsg"  => "ok",
                    "data"    => object!{
                        "path" => file_path,
                    }
                })),
                nfd::Response::Cancel => send_stdout(&json::stringify(object!{
                    "errcode" => 100,
                    "errmsg"  => "canceled",
                })),
                _ => send_stdout(&json::stringify(object!{
                    "errcode" => 1,
                    "errmsg"  => "unexpected result",
                })),
            };

        },
        _ => panic!("unknown json: {}", stdin_str),
    };

}
fn open_path(path:&str ,args:Vec<&str>){
    let path =parse_path_env(path);
    let mut cmd_args =vec!["/Q","/K",path.as_str()];
    cmd_args.append(&mut args.clone());
    Command::new(parse_path_env("%windir%\\System32\\cmd.exe"))
        .creation_flags(winbase::CREATE_BREAKAWAY_FROM_JOB)
        .args(&cmd_args)
        .spawn()
        .expect("failed to execute child")
        .wait_with_output()
        .expect("failed to get child output")
    ;
}
fn parse_path_env(path:&str)->String{
    let regexp =Regex::new(r"^%[\w_]+%").unwrap();
    let placeholder:&str =match regexp.find(path){
        Some(key)=>key.as_str(),
        None=>return String::from(path),
    };
    let env_key =Regex::new(r"%").unwrap().replace_all(placeholder,"").to_string();

    let parsed_env = match std::env::var(&env_key) {
        Ok(val) => val,
        Err(e) => panic!("Cannot get var {}: {}", env_key, e),
    };

    return String::from(path).replace(placeholder,parsed_env.as_str());
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
