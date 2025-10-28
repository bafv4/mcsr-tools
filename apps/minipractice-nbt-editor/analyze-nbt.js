// Node.js script to analyze hotbar.nbt structure
const fs = require('fs');
const nbt = require('prismarine-nbt');

const filePath = './.ref/hotbar.nbt';

fs.readFile(filePath, async (error, data) => {
  if (error) {
    console.error('Error reading file:', error);
    return;
  }

  try {
    const { parsed, type } = await nbt.parse(data);
    console.log('NBT Type:', type);
    console.log('\n=== Full NBT Structure (JSON) ===');
    console.log(JSON.stringify(parsed, null, 2));

    console.log('\n=== Root Keys ===');
    if (parsed.value && typeof parsed.value === 'object') {
      console.log(Object.keys(parsed.value));

      // Check all slots for barrels
      console.log('\n=== All Slots Summary ===');
      for (let i = 0; i < 9; i++) {
        const slot = parsed.value[String(i)];
        if (slot && slot.type === 'list') {
          const items = slot.value?.value;
          if (Array.isArray(items) && items.length > 0) {
            const firstItem = items[0];
            const itemId = firstItem?.id?.value;
            const hasBlockEntity = !!firstItem?.tag?.value?.BlockEntityTag;
            const displayName = firstItem?.tag?.value?.display?.value?.Name?.value;
            console.log(`Slot ${i}: ${itemId} (BlockEntity: ${hasBlockEntity}, Name: ${displayName || 'none'})`);
          }
        }
      }

      // Detailed check on slot 1
      console.log('\n=== Slot 1 Detailed Structure ===');
      const slot1 = parsed.value['1'];
      if (slot1 && slot1.type === 'list') {
        const items = slot1.value?.value;
        if (Array.isArray(items)) {
          console.log(`Found ${items.length} items in slot 1`);
          items.forEach((item, idx) => {
            const itemId = item?.id?.value;
            const hasTag = !!item?.tag;
            const hasBlockEntity = !!item?.tag?.value?.BlockEntityTag;
            console.log(`  Item ${idx}: ${itemId} (hasTag: ${hasTag}, hasBlockEntity: ${hasBlockEntity})`);
          });
        }
      }
    }
  } catch (err) {
    console.error('Error parsing NBT:', err);
  }
});
