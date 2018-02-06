#[macro_use]
extern crate json;

pub mod Response{
    use std::io::{self, Write};

    extern crate byteorder;
    use self::byteorder::{NativeEndian, WriteBytesExt};
    use ::json;

    pub const OK:u32 =0;
    pub const ERROR:u32 =1;
    pub const JSON_ILLEGAL:u32 =101;
    pub const EXEC_ERROR:u32 =102;
    pub const SELECT_FILE_CANCEL:u32 =103;

    
    pub fn str(message: &str){
        let mut stdout = io::stdout();

        let message_length = message.len() as u32;
        let message_length_bytes: [u8; 4] = u32_to_u8(message_length);

        stdout.write(&message_length_bytes).unwrap();
        stdout.write(message.as_bytes()).unwrap();

        stdout.flush().unwrap();
    }
    pub fn json(message: json::JsonValue){
        self::str(json::stringify(message).as_str());
    }
    pub fn create_json(errcode:u32 ,errmsg:&str) -> json::JsonValue{
        return object!{
            "errcode" => errcode,
            "errmsg"  => errmsg,
            "data"    => object!{},
        }
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
}

pub mod Receive{

    use std::io::{self, Read, Cursor};

    extern crate json;
    extern crate byteorder;
    use self::byteorder::{NativeEndian, ReadBytesExt};


    #[derive(Debug)]
    pub enum Error {
        IoError(io::Error),
        ToStringError(::std::string::FromUtf8Error),
        JSONParseError(json::Error),
    }
    impl From<io::Error> for Error {
        fn from(oe: io::Error) -> Error {
            Error::IoError(oe)
        }
    }
    impl From<::std::string::FromUtf8Error> for Error {
        fn from(e: ::std::string::FromUtf8Error) -> Error {
            Error::ToStringError(e)
        }
    }
    impl From<json::Error> for Error {
        fn from(e: json::Error) -> Error {
            Error::JSONParseError(e)
        }
    }
    
    pub fn as_bytes() -> Result<Vec<u8>, Error> {
        let mut stdin = io::stdin();

        let stdin_len: u32;
        let mut stdin_len_byte = [0u8; 4];
        stdin.read_exact(&mut stdin_len_byte)?;
        stdin_len = u8_to_u32(stdin_len_byte);

        let mut data: Vec<u8> = Vec::new();

        for _ in 0..stdin_len {
            let mut byte = [0u8; 1];
            stdin.read_exact(&mut byte)?;
            data.push(byte[0]);
        }

        return Ok(data);
    }
    pub fn as_json() -> Result<json::JsonValue,Error> {
        return Ok(
            json::parse(
                String::from_utf8(
                    as_bytes()?
                )?.as_str()
            )?
        );
    }
    fn u8_to_u32(u8x4: [u8; 4]) -> u32 {
        let mut rdr = Cursor::new(&u8x4);
        return rdr.read_u32::<NativeEndian>().unwrap();
    }
}

