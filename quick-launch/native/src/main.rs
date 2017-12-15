use std::env;
use std::process::Command;
use std::os::windows::process::CommandExt;
use winapi::winbase;
use std::io::{Read,Write,self};
use std::mem::transmute;

#[macro_use] extern crate json;
extern crate winapi;


fn main() {

    loop{
        

        let stdin_str =get_stdin(0);
        let stdin_json =json::parse(&stdin_str).unwrap();

        
        match stdin_json["type"].as_str() {
            Some("open_native_app") =>{
                open_native_app(stdin_json["data"]["target"].as_str().unwrap());
            },
            _ => panic!("unknown json: {}",stdin_str),
        };


        send_stdout(&json::stringify(object!{
            "errcode" => 0,
            "errmsg"  => "ok",
        }));


    }
}

fn open_native_app(target_name :&str){
    let name2path =object!{
        "mspaint"   => "\\System32\\mspaint.exe",
        "calc"      => "\\System32\\calc.exe",
        "notepad"   => "\\System32\\notepad.exe",
        "explorer"  => "\\explorer.exe"
    };
    let windows_path_key = "windir";

    let app_path =name2path[target_name].as_str().unwrap();
    let windows_path =match env::var(windows_path_key) {
        Ok(val) => val,
        Err(e) => panic!("Cannot get var {}: {}", windows_path_key, e),
    };

    Command::new(windows_path+app_path)
        .creation_flags(winbase::CREATE_BREAKAWAY_FROM_JOB)
        .spawn()
        .expect("failed to execute child")
    ;

}
fn send_stdout(message:&str){
    let mut stdout =io::stdout();

    let message_length =message.len() as u32;
    let message_length_bytes: [u8; 4] = unsafe{transmute(message_length)};

    stdout.write(&message_length_bytes).unwrap();
    stdout.write(message.as_bytes()).unwrap();

    stdout.flush().unwrap();
}
fn get_stdin(len:usize) -> String{
    let mut stdin =io::stdin();

    let mut stdin_len:u32;
    if len==0 {
        let mut stdin_len_byte =[0u8;4];
        stdin.read_exact(&mut stdin_len_byte).unwrap();
        stdin_len =unsafe{transmute(stdin_len_byte)};
    } else {
        stdin_len =len as u32;
    };

    let mut byte =[0u8;1];
    let mut data :Vec<u8> =Vec::new();

    while stdin_len >0 {
        stdin_len =stdin_len-1;
        io::stdin().read_exact(&mut byte).unwrap();
        for elt in byte.iter() {
            data.push(*elt);
        };
    };

    return String::from_utf8(data).unwrap();
}