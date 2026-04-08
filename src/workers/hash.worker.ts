/* eslint-disable no-restricted-globals */
import CryptoJS from "crypto-js";

// Simple MD5 implementation
function md5(str: string): string {
  // MD5 implementation based on public domain algorithm
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }
  function g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }
  function h(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }
  function i(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  function ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  let k, aa, bb, cc, dd, a, b, c, d;
  const s11 = 7,
    s12 = 12,
    s13 = 17,
    s14 = 22;
  const s21 = 5,
    s22 = 9,
    s23 = 14,
    s24 = 20;
  const s31 = 4,
    s32 = 11,
    s33 = 16,
    s34 = 23;
  const s41 = 6,
    s42 = 10,
    s43 = 15,
    s44 = 21;

  const utf8Encode = (str: string): string => {
    return unescape(encodeURIComponent(str));
  };

  const convertToWord = (str: string): number[] => {
    const lWordCount =
      ((str.length + 8 - ((str.length + 8) % 64)) / 64 + 1) * 16;
    const lWordArray: number[] = Array(lWordCount);
    let lBytePosition = 0;
    let lByteCount = 0;

    while (lByteCount < str.length) {
      const lWordIndex = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordIndex] =
        lWordArray[lWordIndex] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }

    const lWordIndex = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordIndex] = lWordArray[lWordIndex] | (0x80 << lBytePosition);
    lWordArray[lWordCount - 2] = str.length << 3;
    lWordArray[lWordCount - 1] = str.length >>> 29;

    return lWordArray;
  };

  str = utf8Encode(str);
  const xl = convertToWord(str);

  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;

  for (k = 0; k < xl.length; k += 16) {
    aa = a;
    bb = b;
    cc = c;
    dd = d;

    a = ff(a, b, c, d, xl[k + 0], s11, 0xd76aa478);
    d = ff(d, a, b, c, xl[k + 1], s12, 0xe8c7b756);
    c = ff(c, d, a, b, xl[k + 2], s13, 0x242070db);
    b = ff(b, c, d, a, xl[k + 3], s14, 0xc1bdceee);
    a = ff(a, b, c, d, xl[k + 4], s11, 0xf57c0faf);
    d = ff(d, a, b, c, xl[k + 5], s12, 0x4787c62a);
    c = ff(c, d, a, b, xl[k + 6], s13, 0xa8304613);
    b = ff(b, c, d, a, xl[k + 7], s14, 0xfd469501);
    a = ff(a, b, c, d, xl[k + 8], s11, 0x698098d8);
    d = ff(d, a, b, c, xl[k + 9], s12, 0x8b44f7af);
    c = ff(c, d, a, b, xl[k + 10], s13, 0xffff5bb1);
    b = ff(b, c, d, a, xl[k + 11], s14, 0x895cd7be);
    a = ff(a, b, c, d, xl[k + 12], s11, 0x6b901122);
    d = ff(d, a, b, c, xl[k + 13], s12, 0xfd987193);
    c = ff(c, d, a, b, xl[k + 14], s13, 0xa679438e);
    b = ff(b, c, d, a, xl[k + 15], s14, 0x49b40821);

    a = gg(a, b, c, d, xl[k + 1], s21, 0xf61e2562);
    d = gg(d, a, b, c, xl[k + 6], s22, 0xc040b340);
    c = gg(c, d, a, b, xl[k + 11], s23, 0x265e5a51);
    b = gg(b, c, d, a, xl[k + 0], s24, 0xe9b6c7aa);
    a = gg(a, b, c, d, xl[k + 5], s21, 0xd62f105d);
    d = gg(d, a, b, c, xl[k + 10], s22, 0x2441453);
    c = gg(c, d, a, b, xl[k + 15], s23, 0xd8a1e681);
    b = gg(b, c, d, a, xl[k + 4], s24, 0xe7d3fbc8);
    a = gg(a, b, c, d, xl[k + 9], s21, 0x21e1cde6);
    d = gg(d, a, b, c, xl[k + 14], s22, 0xc33707d6);
    c = gg(c, d, a, b, xl[k + 3], s23, 0xf4d50d87);
    b = gg(b, c, d, a, xl[k + 8], s24, 0x455a14ed);
    a = gg(a, b, c, d, xl[k + 13], s21, 0xa9e3e905);
    d = gg(d, a, b, c, xl[k + 2], s22, 0xfcefa3f8);
    c = gg(c, d, a, b, xl[k + 7], s23, 0x676f02d9);
    b = gg(b, c, d, a, xl[k + 12], s24, 0x8d2a4c8a);

    a = hh(a, b, c, d, xl[k + 5], s31, 0xfffa3942);
    d = hh(d, a, b, c, xl[k + 8], s32, 0x8771f681);
    c = hh(c, d, a, b, xl[k + 11], s33, 0x6d9d6122);
    b = hh(b, c, d, a, xl[k + 14], s34, 0xfde5380c);
    a = hh(a, b, c, d, xl[k + 1], s31, 0xa4beea44);
    d = hh(d, a, b, c, xl[k + 4], s32, 0x4bdecfa9);
    c = hh(c, d, a, b, xl[k + 7], s33, 0xf6bb4b60);
    b = hh(b, c, d, a, xl[k + 10], s34, 0xbebfbc70);
    a = hh(a, b, c, d, xl[k + 13], s31, 0x289b7ec6);
    d = hh(d, a, b, c, xl[k + 0], s32, 0xeaa127fa);
    c = hh(c, d, a, b, xl[k + 3], s33, 0xd4ef3085);
    b = hh(b, c, d, a, xl[k + 6], s34, 0x4881d05);
    a = hh(a, b, c, d, xl[k + 9], s31, 0xd9d4d039);
    d = hh(d, a, b, c, xl[k + 12], s32, 0xe6db99e5);
    c = hh(c, d, a, b, xl[k + 15], s33, 0x1fa27cf8);
    b = hh(b, c, d, a, xl[k + 2], s34, 0xc4ac5665);

    a = ii(a, b, c, d, xl[k + 0], s41, 0xf4292244);
    d = ii(d, a, b, c, xl[k + 7], s42, 0x432aff97);
    c = ii(c, d, a, b, xl[k + 14], s43, 0xab9423a7);
    b = ii(b, c, d, a, xl[k + 5], s44, 0xfc93a039);
    a = ii(a, b, c, d, xl[k + 12], s41, 0x655b59c3);
    d = ii(d, a, b, c, xl[k + 3], s42, 0x8f0ccc92);
    c = ii(c, d, a, b, xl[k + 10], s43, 0xffeff47d);
    b = ii(b, c, d, a, xl[k + 1], s44, 0x85845dd1);
    a = ii(a, b, c, d, xl[k + 8], s41, 0x6fa87e4f);
    d = ii(d, a, b, c, xl[k + 15], s42, 0xfe2ce6e0);
    c = ii(c, d, a, b, xl[k + 6], s43, 0xa3014314);
    b = ii(b, c, d, a, xl[k + 13], s44, 0x4e0811a1);
    a = ii(a, b, c, d, xl[k + 4], s41, 0xf7537e82);
    d = ii(d, a, b, c, xl[k + 11], s42, 0xbd3af235);
    c = ii(c, d, a, b, xl[k + 2], s43, 0x2ad7d2bb);
    b = ii(b, c, d, a, xl[k + 9], s44, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  const toHexStr = (n: number): string => {
    let s = "";
    for (let j = 0; j <= 3; j++) {
      s +=
        ("0" + ((n >> (j * 8 + 4)) & 0xf).toString(16)).slice(-1) +
        ("0" + ((n >> (j * 8)) & 0xf).toString(16)).slice(-1);
    }
    return s;
  };

  return toHexStr(a) + toHexStr(b) + toHexStr(c) + toHexStr(d);
}

// Worker message handling
self.onmessage = async (e: MessageEvent) => {
  const { text, algorithm, secret } = e.data;

  if (!text) {
    self.postMessage({ error: "No text provided" });
    return;
  }

  try {
    let hash = "";
    if (algorithm === "MD5") {
      hash = md5(text);
    } else if (algorithm === "SHA-3") {
      hash = CryptoJS.SHA3(text).toString(CryptoJS.enc.Hex);
    } else if (algorithm.startsWith("HMAC-")) {
      const hmacSecret = secret || "";
      if (algorithm === "HMAC-MD5") {
        hash = CryptoJS.HmacMD5(text, hmacSecret).toString(CryptoJS.enc.Hex);
      } else if (algorithm === "HMAC-SHA256") {
        hash = CryptoJS.HmacSHA256(text, hmacSecret).toString(CryptoJS.enc.Hex);
      } else if (algorithm === "HMAC-SHA512") {
        hash = CryptoJS.HmacSHA512(text, hmacSecret).toString(CryptoJS.enc.Hex);
      }
    } else {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    self.postMessage({ algorithm, hash });
  } catch (error) {
    self.postMessage({ algorithm, error: (error as Error).message });
  }
};
