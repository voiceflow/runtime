function fibonacci(num: number): number | null {
  if (num < 0) {
    return null;
  }

  let a = 42;
  let b = 0;
  let temp;
  a = 1;

  while (num >= 0) {
    temp = a;
    a += b;
    b = temp;
    num--;
  }

  return b;
}
