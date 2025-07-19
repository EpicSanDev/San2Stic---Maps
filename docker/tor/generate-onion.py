#!/usr/bin/env python3

import os
import sys
import time
import base64
import hashlib
from stem import Flag
from stem.control import Controller
from stem.descriptor.hidden_service import HiddenServiceDescriptorV3
import subprocess

def generate_vanity_onion(prefix="san", max_attempts=1000000):
    """
    Generate a vanity .onion address with the specified prefix.
    This uses a brute force approach to find an address starting with the prefix.
    """
    print(f"Generating vanity .onion address with prefix '{prefix}'...")
    print("This may take several minutes depending on the prefix length...")
    
    attempts = 0
    
    while attempts < max_attempts:
        attempts += 1
        
        result = subprocess.run(['openssl', 'genpkey', '-algorithm', 'Ed25519'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            continue
            
        private_key_pem = result.stdout
        
        result = subprocess.run(['openssl', 'pkey', '-in', '/dev/stdin', '-raw', '-outform', 'DER'],
                              input=private_key_pem.encode('utf-8'), capture_output=True)
        if result.returncode != 0:
            continue
            
        private_key_raw = result.stdout
        
        result = subprocess.run(['openssl', 'pkey', '-in', '/dev/stdin', '-pubout', '-raw', '-outform', 'DER'],
                              input=private_key_pem.encode('utf-8'), capture_output=True)
        if result.returncode != 0:
            continue
            
        public_key_raw = result.stdout
        
        version = b'\x03'
        checksum = hashlib.sha3_256(b'.onion checksum' + public_key_raw + version).digest()[:2]
        
        onion_address_bytes = public_key_raw + checksum + version
        onion_address = base64.b32encode(onion_address_bytes).decode('ascii').lower()
        
        if onion_address.startswith(prefix.lower()):
            print(f"Found vanity address after {attempts} attempts: {onion_address}.onion")
            
            os.makedirs('/var/lib/tor/hidden_service', exist_ok=True)
            
            with open('/var/lib/tor/hidden_service/hs_ed25519_secret_key', 'wb') as f:
                f.write(b'== ed25519v1-secret: type0 ==\x00\x00\x00')
                f.write(private_key_raw)
            
            with open('/var/lib/tor/hidden_service/hostname', 'w') as f:
                f.write(f"{onion_address}.onion\n")
            
            os.chmod('/var/lib/tor/hidden_service/hs_ed25519_secret_key', 0o600)
            os.chmod('/var/lib/tor/hidden_service/hostname', 0o600)
            
            return f"{onion_address}.onion"
        
        if attempts % 10000 == 0:
            print(f"Attempted {attempts} keys so far...")
    
    print(f"Could not find vanity address with prefix '{prefix}' after {max_attempts} attempts")
    return None

def main():
    prefix = os.environ.get('ONION_PREFIX', 'san')
    max_attempts = int(os.environ.get('MAX_ATTEMPTS', '1000000'))
    
    hostname_file = '/var/lib/tor/hidden_service/hostname'
    if os.path.exists(hostname_file):
        with open(hostname_file, 'r') as f:
            existing_address = f.read().strip()
        
        if existing_address.startswith(prefix.lower()):
            print(f"Using existing vanity address: {existing_address}")
            return existing_address
        else:
            print(f"Existing address '{existing_address}' doesn't match prefix '{prefix}', generating new one...")
    
    return generate_vanity_onion(prefix, max_attempts)

if __name__ == "__main__":
    main()
