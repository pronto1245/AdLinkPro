export class DatabaseStorage {
  async getItem(key: string): Promise<any> {
    console.log("getItem:", key);
    return null;
  }

  async setItem(key: string, value: any): Promise<void> {
    console.log("setItem:", key, value);
  }

  // 👉 добавь другие методы по мере необходимости
}
