import QRCode from 'qrcode';

export async function createQRCodeDataUri(value: string) {
  return QRCode.toDataURL(value, {
    type: 'image/png',
    margin: 1,
    width: 240
  });
}
