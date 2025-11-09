import type { StandardSettings, KeyConfig, PhysicalKey } from '../types';

export function exportStandardSettings(
  keyConfigs: Map<PhysicalKey, KeyConfig>,
  baseSettings: Partial<StandardSettings>
): string {
  // Start with base settings
  const output: any = { ...baseSettings };

  // Add key bindings from keyConfigs
  keyConfigs.forEach((config) => {
    if (config.binding) {
      const keyName = `key_${config.binding.action}`;
      output[keyName] = config.binding.key;
    }
  });

  // Convert to JSON with proper formatting
  return JSON.stringify(output, null, 2);
}

export function downloadStandardSettings(
  keyConfigs: Map<PhysicalKey, KeyConfig>,
  baseSettings: Partial<StandardSettings>
): void {
  const json = exportStandardSettings(keyConfigs, baseSettings);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'standardsettings.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
