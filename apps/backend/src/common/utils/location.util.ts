// Rút gọn mã Zone/Rack gốc trong DB ("Zone A", "Rack 01"...) thành định dạng
// gọn cho UI, ví dụ: "Z-A / R01 / L02 / S01".
export function formatSlotLocation(params: {
  zoneCode: string;
  rackCode: string;
  levelNumber: number;
  slotCode: string;
}): string {
  const zonePart = params.zoneCode.replace(/^Zone\s*/i, 'Z-');
  const rackPart = params.rackCode.replace(/^Rack\s*/i, 'R');
  const levelPart = `L${String(params.levelNumber).padStart(2, '0')}`;
  return `${zonePart} / ${rackPart} / ${levelPart} / ${params.slotCode}`;
}
