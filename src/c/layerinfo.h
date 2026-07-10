#pragma once
#include <pebble.h>

#define TYPE_TEXT    1
#define TYPE_IMAGE   2 
#define TYPE_DYNAMIC 3
#define TYPE_ANALOG  5
#define TYPE_RECT    6
#define TYPE_CIRCLE  7

#define DYNAMIC_UP    0x08
#define DYMANIC_DOWN  0x04
#define DYNAMIC_LEFT  0x02
#define DYNAMIC_RIGHT 0x01

#define LAYER_ENABLED 0x01
#define DRAW_OUTLINE  0x02

typedef struct LayerInfo {
  uint32_t LayerSettings;
  uint32_t ContentSettings;
  uint16_t Radius;
  GRect Rect;
  uint8_t DynamicMask;
  GColor BackgroundColor;
  GColor ForegroundColor;
  uint8_t Type;
  uint8_t FontSettings;
  char Content[41];
} LayerInfo; //should be 62 bytes, padded to 64, plus a 12-byte header for persistent storage is 76 bytes

void draw_layer(GContext * ctx, LayerInfo * layer);

uint8_t build_font_settings(uint8_t font_selection, GTextAlignment alignment, GTextOverflowMode overflow);