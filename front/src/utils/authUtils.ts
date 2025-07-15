import forge from 'node-forge';

const AuthUtils = {
  encrypt: (data: string, publicKey: string) => {
    const pemKey =
      `-----BEGIN PUBLIC KEY-----\n${
      publicKey
      }\n` +
      `-----END PUBLIC KEY-----`;
    const pubKey = forge.pki.publicKeyFromPem(pemKey);

    const encrypted = pubKey.encrypt(data);

    return forge.util.encode64(encrypted);
  },
};

export default AuthUtils;
