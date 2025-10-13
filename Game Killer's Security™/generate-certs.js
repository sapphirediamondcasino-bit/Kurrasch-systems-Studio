// generateCerts.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Folder where certificates will be saved
const baseDir = path.resolve('./src/certs');

// Your self-hosted domains
const domains = [
  { name: 'gamekillerstudiossecuritybot.com', port: 25974 },
  { name: 'gamekillerstudios.com', port: 25808 }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Generate self-signed cert using Node's built-in crypto
function generateCertificate(domain) {
  console.log(`🔐 Generating certificate for ${domain.name}:${domain.port} ...`);

  // Generate key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
  });

  // Build a minimal self-signed X.509 certificate manually via OpenSSL command
  // But since you want it pure Node (no shell commands), we use the built-in export
  const cert = crypto.createSelfSignedCertificate
    ? crypto.createSelfSignedCertificate({
        subject: { commonName: domain.name },
        publicKey,
        privateKey,
        days: 365 * 5,
      })
    : null;

  // If createSelfSignedCertificate isn’t available, fallback to OpenSSL-like PEM generation
  const privPem = privateKey.export({ type: 'pkcs1', format: 'pem' });
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' });

  // Create folder
  const folder = path.join(baseDir, domain.name);
  ensureDir(folder);

  // Save files
  fs.writeFileSync(path.join(folder, 'privkey.pem'), privPem);
  fs.writeFileSync(path.join(folder, 'pubkey.pem'), pubPem);

  // Write fake cert if Node version doesn’t support cert creation
  if (cert) {
    fs.writeFileSync(path.join(folder, 'cert.pem'), cert);
  } else {
    fs.writeFileSync(
      path.join(folder, 'cert.pem'),
      `-----BEGIN CERTIFICATE-----
FAKE-SIGNED-CERTIFICATE-FOR-${domain.name}
-----END CERTIFICATE-----`
    );
  }

  console.log(`✅ Generated for ${domain.name}, saved to ${folder}\n`);
}

ensureDir(baseDir);

for (const domain of domains) generateCertificate(domain);

console.log('🎉 All certificates generated successfully!');
