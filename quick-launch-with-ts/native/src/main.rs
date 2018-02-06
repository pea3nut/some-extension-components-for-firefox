extern crate native_launcher;
use native_launcher::{Response,Receive};

#[macro_use]
extern crate json;


fn main() {


    loop{

        // If you want test code, the stdin_str should like this:
        // match dev() {
        // and use `cargo build && .\target\debug\native_launcher.exe > out.txt` instead of cargo run,
        // the run result will saved in out.txt by UTF-8 encode.
        // see https://github.com/rust-lang/cargo/issues/4841

        match Receive::as_json() {

            Ok(receive_json) => match receive_json["type"].as_str() {
                Some("open_path")   => Actions::open_path(&receive_json["data"]),
                Some("select_file") => Actions::select_file(),
                _ => Response::json(Response::create_json(
                    Response::JSON_ILLEGAL,
                    format!(r#""type" key is illgal. {:?}"#,receive_json).as_str()
                )),
            },
            Err(Receive::Error::IoError(e))        => eprintln!("Receive data error: {}",e),
            Err(Receive::Error::ToStringError(e))  => eprintln!("Decode to string error: {}",e),
            Err(Receive::Error::JSONParseError(e)) => {
                Response::json(Response::create_json(
                    Response::JSON_ILLEGAL,
                    format!("JSON parse error: {}",e).as_str()
                ));
            },

        };

    };


        

}
fn dev() -> Result<json::JsonValue,Receive::Error> {
    return Ok(json::parse(r#"
        {
            "type": "open_path",
            "data": {
                "path": "D:\\Program Files\\UCBrowser\\Application\\UCBrowser.exe",
                "args": []
            }
        }
    "#)?);
}
mod Actions{
    use std::process::{Command,Stdio};
    use std::os::windows::process::CommandExt;
    extern crate json;
    extern crate nfd;
    extern crate native_launcher;use self::native_launcher::Response;
    extern crate winapi;use self::winapi::winbase;
    extern crate regex;use self::regex::Regex;
    extern crate local_encoding;use self::local_encoding::{Encoding, Encoder};
    
    use std::io::{self, Cursor, Write};

    extern crate byteorder;
    use self::byteorder::{NativeEndian, ReadBytesExt};
        
        

    pub fn open_path(data: &json::JsonValue){
        if !data["path"].is_string() {
            Response::json(Response::create_json(
                Response::JSON_ILLEGAL,
                r#"Illegal "path" key."#
            ));
            return ();
        };
        let path =data["path"].as_str().unwrap();
        let args:Vec<&str> =match data["args"]{
            json::JsonValue::Array(ref arr) => {
                let mut args =Vec::new();
                for item in arr.iter() {
                    if !item.is_string() {
                        Response::json(Response::create_json(
                            Response::JSON_ILLEGAL,
                            "Expect Array<string> in data.args"
                        ));
                        return ();
                    };
                    args.push(item.as_str().unwrap());
                };
                args
            },
            _ =>Vec::new(),
        };
        match exec(path,args) {
            Ok(output) => {
                if output.status.success() {
                    Response::json(Response::create_json(
                        Response::OK,
                        byte2string(&output.stdout).as_str()
                    ))
                }else{
                    let mut response_json =Response::create_json(
                        Response::EXEC_ERROR,
                        "got not 0 status"
                    );
                    

                    

                    
                    // use std::fs::File;
                    // use std::io::prelude::*;
                    // let mut file = File::create("stdout.txt").unwrap();
                    // file.write_all(&output.stdout.clone()).unwrap();
                    // let mut file = File::create("stdou.encoded.txt").unwrap();
                    // file.write_all(
                    //     Encoding::ANSI.to_string(
                    //         output.stdout.clone().as_slice()
                    //     ).unwrap().as_str().as_bytes()
                    // ).unwrap();

                    response_json["data"] =object!{
                        "exit_code" => output.status.code().unwrap(),
                        "stdout" => byte2string(&output.stdout),
                        "stderr" => byte2string(&output.stderr),
                    };
                    Response::json(response_json);
                }
            },
            Err(e) => Response::json(Response::create_json(
                Response::ERROR,
                e.to_string().as_str()
            )),
        };
    }

    fn byte2string(bytes: &Vec<u8>) -> String {
        return Encoding::ANSI.to_string(bytes.as_slice())
            .unwrap_or(
                String::from_utf8(bytes.clone())
                    .unwrap_or(format!("{:?}",bytes.as_slice()))
            )
        ;
    }
    pub fn select_file(){
        let result = nfd::open_file_dialog(None, None).expect("Select file error!");

        match result {
            nfd::Response::Okay(file_path) => {
                let mut message =Response::create_json(
                    Response::OK,
                    "ok"
                );
                message["data"]["path"] =json::JsonValue::String(file_path);
                Response::json(message);
            },
            nfd::Response::Cancel => Response::json(Response::create_json(
                Response::SELECT_FILE_CANCEL,
                "user cancel."
            )),
            _ => Response::json(Response::create_json(
                Response::ERROR,
                "error."
            )),
        };

    }
    fn exec(path:&str ,args:Vec<&str>) -> Result<::std::process::Output,io::Error>{
        let path =parse_path_env(path);
        let cmd_args =vec!["/A","/K","@echo off"];
        let mut child =Command::new(parse_path_env("%windir%\\System32\\cmd.exe"))
            .creation_flags(winbase::CREATE_BREAKAWAY_FROM_JOB)
            .args(&cmd_args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Failed to spawn child process")
        ;
        {
            let stdin = child.stdin.as_mut().expect("Failed to open stdin");
            stdin.write_all(
                Encoding::ANSI.to_bytes(
                    format!(r#"start "Title" "{}" {}"#,path,str_array_join(args)).as_str()
                ).unwrap().as_slice()
            ).expect("Failed to write to stdin");
            stdin.write_all("\r\n".as_bytes()).expect("Failed to write to stdin");
            stdin.write_all("exit %errorlevel%\r\n".as_bytes()).expect("Failed to write to stdin");
        }
        return child.wait_with_output();
    }
    fn parse_path_env(path:&str)->String{
        let regexp =Regex::new(r"^%[\w_]+%").unwrap();
        let placeholder:&str =match regexp.find(path){
            Some(key)=>key.as_str(),
            None=>return String::from(path),
        };
        let env_key =Regex::new(r"%").unwrap().replace_all(placeholder,"").to_string();

        let parsed_env = match ::std::env::var(&env_key) {
            Ok(val) => val,
            Err(e) => panic!("Cannot get var {}: {}", env_key, e),
        };

        return String::from(path).replace(placeholder,parsed_env.as_str());
    }
    fn str_array_join(arr: Vec<&str>) -> String{
        let mut res_str =String::new();
        for item in arr.iter() {
            res_str.push_str(" ");
            res_str.push_str(item);
        }
        return res_str;
    }
}