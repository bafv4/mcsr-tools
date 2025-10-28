import { parse } from 'prismarine-nbt';
import { Buffer } from 'buffer';

/**
 * Debug function to parse and log NBT file structure
 */
export async function debugNBTFile(file: File): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const { parsed } = await parse(buffer);
    console.log('=== NBT File Structure ===');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('=========================');

    // Also log in a more readable format
    console.log('=== Readable Format ===');
    console.log(parsed);
    console.log('======================');
  } catch (error) {
    console.error('Failed to parse NBT file:', error);
  }
}
