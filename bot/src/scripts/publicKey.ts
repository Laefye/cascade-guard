import 'dotenv/config';
import { KeyPair } from '../keys.js';
import { config } from '../config.js';

const keyPair = KeyPair.load(config.keypairDir);

console.log("Public Key:", keyPair.encodedPublicKey);
