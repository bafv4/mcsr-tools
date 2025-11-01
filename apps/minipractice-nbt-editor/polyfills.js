import { Buffer } from 'buffer';
import process from 'process/browser.js';

window.Buffer = Buffer;
window.process = process;
