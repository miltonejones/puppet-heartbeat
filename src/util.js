



// create an named bitwise object 
export const LilBit = (names) => ((e) => {
    names.map((n, i) => e[n] = Math.pow(2, i));
    return e;
  })({});