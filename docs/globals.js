const ADDRESS0 = "0x0000000000000000000000000000000000000000";
const SECP256K1_N = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";
const generateRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
const delay = ms => new Promise(res => setTimeout(res, ms));
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
