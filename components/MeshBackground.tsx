const LEFT = [
  [48, 210],
  [150, 120],
  [210, 250],
  [70, 360],
  [230, 400],
  [120, 490],
  [250, 150],
] as const;

const RIGHT = [
  [1180, 160],
  [1320, 100],
  [1388, 230],
  [1220, 300],
  [1360, 390],
  [1160, 450],
  [1290, 520],
] as const;

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 6],
  [1, 2],
  [0, 2],
  [0, 3],
  [3, 5],
  [2, 4],
  [5, 4],
  [4, 6],
];

export function MeshBackground() {
  const lines = [
    ...EDGES.map(([a, b]) => [LEFT[a], LEFT[b]] as const),
    ...EDGES.map(([a, b]) => [RIGHT[a], RIGHT[b]] as const),
  ];

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[780px] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute left-1/2 top-0 h-[780px] w-[1440px] max-w-none -translate-x-1/2"
        viewBox="0 0 1440 780"
        fill="none"
      >
        {lines.map(([a, b], index) => (
          <line
            key={index}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke="#0c6a4c"
            strokeOpacity="0.28"
            strokeWidth="1"
          />
        ))}
        {[...LEFT, ...RIGHT].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill="#0c6a4c" fillOpacity="0.45" />
        ))}
      </svg>
    </div>
  );
}
