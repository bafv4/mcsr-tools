import type { KeyConfig, PhysicalKey } from '../types';

export function exportAHK(keyConfigs: Map<PhysicalKey, KeyConfig>): string {
  const lines: string[] = [];

  // Add header
  lines.push('#IfWinActive Minecraft');

  // Collect all remaps
  const remaps: string[] = [];

  keyConfigs.forEach((config) => {
    if (config.ahkRemap) {
      if (config.ahkRemap.disabled) {
        // Disabled key
        remaps.push(`${config.physicalKey}:: Return`);
      } else if (config.ahkRemap.to) {
        // Remap to another key
        remaps.push(`${config.physicalKey}:: ${config.ahkRemap.to}`);
      }
    }
  });

  // Sort remaps alphabetically for consistency
  remaps.sort();

  // Add remaps to output
  lines.push(...remaps);

  return lines.join('\n');
}

export function downloadAHK(keyConfigs: Map<PhysicalKey, KeyConfig>): void {
  const script = exportAHK(keyConfigs);
  const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'remap.ahk';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
