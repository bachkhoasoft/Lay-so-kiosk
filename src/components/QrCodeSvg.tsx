import React from 'react';

// Generates an authentic-looking, deterministic SVG QR code pattern based on the text/URL
export function QrCodeSvg({ value, size = 120, className = '' }: { value: string; size?: number; className?: string }) {
  // Deterministic pseudo-random matrix generator based on input string
  const gridSize = 25;
  const matrix: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

  // Finder patterns at 3 corners (7x7)
  const setFinderPattern = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 || // Outer square
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)      // Inner solid square
        ) {
          matrix[r + i][c + j] = true;
        } else {
          matrix[r + i][c + j] = false;
        }
      }
    }
  };

  setFinderPattern(0, 0); // Top-left
  setFinderPattern(0, gridSize - 7); // Top-right
  setFinderPattern(gridSize - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data cells deterministically based on hash of value string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  let pseudoRand = hash;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder corners and timing
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        pseudoRand = (pseudoRand * 1664525 + 1013904223) >>> 0;
        matrix[r][c] = (pseudoRand % 100) > 42;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-1 rounded-sm ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill="#1e293b"
            />
          ) : null
        )
      )}
    </svg>
  );
}
