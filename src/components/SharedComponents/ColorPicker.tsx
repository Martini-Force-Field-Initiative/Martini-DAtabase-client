import React from 'react';
import { Box, Button, Menu, MenuItem, Tooltip } from '@mui/material';

export const DEFAULT_PALETTE: string[] = [
  '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
  '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d',
  '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
  '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6',
];

export interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  colors?: string[];
  swatchSize?: number;
  columns?: number;
}

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_PALETTE,
  swatchSize = 24,
  columns = 5,
}: ColorPickerProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${swatchSize}px)`,
        gap: '6px',
        p: 0.5,
      }}
    >
      {colors.map((color) => {
        const selected = value?.toLowerCase() === color.toLowerCase();
        return (
          <Tooltip key={color} title={color} placement="top" arrow>
            <Box
              role="button"
              aria-label={`Pick color ${color}`}
              onClick={() => onChange(color)}
              sx={{
                width: swatchSize,
                height: swatchSize,
                bgcolor: color,
                borderRadius: '4px',
                cursor: 'pointer',
                border: selected ? '2px solid #000' : '1px solid rgba(0,0,0,0.2)',
                boxSizing: 'border-box',
                transition: 'transform 80ms ease-in-out',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

export interface ColorPickerMenuProps extends ColorPickerProps {
  label?: string;
  buttonSize?: number;
}

export function ColorPickerMenu({
  value,
  onChange,
  colors,
  swatchSize,
  columns,
  label,
  buttonSize = 28,
}: ColorPickerMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePick = (color: string) => {
    onChange(color);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        size="small"
        variant="outlined"
        startIcon={
          <Box
            sx={{
              width: buttonSize - 12,
              height: buttonSize - 12,
              bgcolor: value ?? 'transparent',
              borderRadius: '3px',
              border: '1px solid rgba(0,0,0,0.3)',
            }}
          />
        }
      >
        {label ?? value ?? 'Pick color'}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem disableRipple sx={{ '&:hover': { bgcolor: 'transparent' }, cursor: 'default' }}>
          <ColorPicker
            value={value}
            onChange={handlePick}
            colors={colors}
            swatchSize={swatchSize}
            columns={columns}
          />
        </MenuItem>
      </Menu>
    </>
  );
}

export default ColorPicker;
