#!/usr/bin/env python3
"""Vault encryptor for akamaestro.com — envelope encryption for gated pages.

How it works
------------
Each vault section's HTML is encrypted ONCE with a random 256-bit content key
(AES-256-GCM). That content key is then "wrapped" separately for every password
allowed to open the section (PBKDF2-SHA256 310k iters -> AES-GCM). The master
password is simply included in every section's password list, so it opens
everything; audience passwords open only their sections. No password, hash, or
audience label is stored in the output — only ciphertext.

Usage
-----
1) Copy the example config and edit it (KEEP IT OUT OF GIT — it holds passwords):

     cp tools/vault.config.example.json tools/vault.config.json

2) Run:

     tools/.venv/bin/python tools/encrypt_vault.py tools/vault.config.json

   This writes assets/vault-data.json (safe to commit — ciphertext only).

Config format (tools/vault.config.json):
{
  "master_password": "the-master-key",
  "audiences": { "recruiters": "pass-a", "publishers": "pass-b" },
  "sections": [
    { "id": "contact", "title": "Direct Line",
      "html_file": "tools/vault-content/contact.html",   // or inline "html"
      "audiences": ["recruiters"] }                       // master always added
  ]
}
"""
import base64
import json
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

REPO = Path(__file__).resolve().parent.parent
ITERATIONS = 310_000


def b64(b: bytes) -> str:
    return base64.b64encode(b).decode()


def derive(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    return kdf.derive(password.encode())


def encrypt_section(section: dict, passwords: list) -> dict:
    if "html" in section:
        html = section["html"]
    else:
        html = (REPO / section["html_file"]).read_text()

    content_key = AESGCM.generate_key(bit_length=256)
    iv = os.urandom(12)
    ct = AESGCM(content_key).encrypt(iv, html.encode(), None)

    wraps = []
    for pw in passwords:
        salt = os.urandom(16)
        wiv = os.urandom(12)
        kek = derive(pw, salt)
        wk = AESGCM(kek).encrypt(wiv, content_key, None)
        wraps.append({"salt": b64(salt), "iv": b64(wiv), "wk": b64(wk)})

    return {"id": section["id"], "title": section["title"],
            "iv": b64(iv), "ct": b64(ct), "wraps": wraps}


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    cfg = json.loads(Path(sys.argv[1]).read_text())
    master = cfg["master_password"]
    audiences = cfg.get("audiences", {})

    out_sections = []
    for s in cfg["sections"]:
        pws = [master] + [audiences[a] for a in s.get("audiences", [])]
        out_sections.append(encrypt_section(s, pws))
        print(f"  encrypted section '{s['id']}' for {1 + len(s.get('audiences', []))} password(s)")

    out = {"kdf": {"name": "PBKDF2", "hash": "SHA-256", "iterations": ITERATIONS},
           "sections": out_sections}
    dest = REPO / "assets" / "vault-data.json"
    dest.write_text(json.dumps(out))
    print(f"Wrote {dest.relative_to(REPO)} ({dest.stat().st_size} bytes). Safe to commit.")


if __name__ == "__main__":
    main()
