#pragma once
#include <pebble.h>

// Type "enum"
#define TYPE_TEXT    1 //done
#define TYPE_IMAGE   2 
#define TYPE_DYNAMIC 3
#define TYPE_ANALOG  5
#define TYPE_RECT    6 //done

// DynamicMask Bits
#define DYNAMIC_UP    0x08
#define DYMANIC_DOWN  0x04
#define DYNAMIC_LEFT  0x02
#define DYNAMIC_RIGHT 0x01

// LayerSettings Bits
#define LAYER_ENABLED 0x00000001
#define DRAW_OUTLINE  0x00000002
#define DITHER_MASK   (0x04 | 0x08)
#define DITHER_LR     0x00000004
#define DITHER_UD     0x00000008
#define DITHER_MIX    (DITHER_LR | DITHER_UD)
#define INVERTER      0x00000010

#define DRAW_HOUR 0x00000002
#define DRAW_MIN  0x00000004
#define DRAW_SEC  0x00000008

typedef struct LayerInfo {
  GRect Rect; //8
  uint32_t LayerSettings; //4
  uint32_t ContentSettings; //4
  uint16_t Radius; //2
  uint8_t DynamicMask; //1
  GColor BackgroundColor; //1
  GColor ForegroundColor; //1
  uint8_t Type; //1
  uint8_t FontSettings; //1
  char Content[41]; //41
} LayerInfo; //should be 64 bytes, padded to 64, plus a 12-byte header for persistent storage is 76 bytes