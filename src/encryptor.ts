type AnyObject = { [x: string]: string | number  | AnyObject }
export class Encryptor {
  static encryptor(data: string, key: string) {
    let crypted = ''
    for (let i = 0; i < data.length; i++) {
      crypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return crypted
  }
  static encode(data: AnyObject | string | number, key: string): string {
    switch (typeof data) {
      case 'object':
        return Encryptor.encryptor(`${JSON.stringify(data)}${key}object`, key)
      case 'number':
        return Encryptor.encryptor(`${data.toString()}${key}number`, key)
      case 'string':
        return Encryptor.encryptor(`${data}${key}string`, key)
    }
  }
  static decode(data: string, key: string): AnyObject | number | string | undefined {
    data = Encryptor.encryptor(data, key)
    const [value, type] = data.split(key)
    switch (type) {
      case 'object':
        return JSON.parse(value)
      case 'number':
        return parseInt(value)
      case 'string':
        return value
    }
  }
}