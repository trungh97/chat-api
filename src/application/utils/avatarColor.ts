export function getAvatarColors(name: string): {
  background: string;
  text: string;
} {
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#87d068",
    "#1890ff",
    "#eb2f96",
    "#fa8c16",
    "#13c2c2",
    "#52c41a",
    "#2f54eb",
    "#fa541c",
  ];

  const hash = [...name].reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );
  const index = Math.abs(hash) % colors.length;
  const background = colors[index];

  const text = isDarkColor(background) ? "#ffffff" : "#000000";

  return { background, text };
}

function isDarkColor(hex: string): boolean {
  const c = hex.substring(1); // remove '#'
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // YIQ formula to determine brightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}
