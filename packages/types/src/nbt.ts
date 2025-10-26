export type NBTType =
  | 'byte'
  | 'short'
  | 'int'
  | 'long'
  | 'float'
  | 'double'
  | 'string'
  | 'byteArray'
  | 'intArray'
  | 'longArray'
  | 'list'
  | 'compound';

export interface NBTTag {
  type: NBTType;
  name?: string;
  value: unknown;
}
